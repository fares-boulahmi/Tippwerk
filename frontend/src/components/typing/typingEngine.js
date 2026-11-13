// Pure state machine for the typing test. No React in here, so it is easy to test.
//
// state = {
//   targets: ['Haus', 'Auto', ...]   words to type
//   typed:   ['Ha', '', ...]         what the user typed for each word
//   current: 0                       index of the word being typed
//   startedAt / finishedAt           performance.now() timestamps
//   keyCorrect / keyWrong            per-keystroke accuracy (corrections don't erase mistakes)
// }

const MAX_EXTRA = 10; // like Monkeytype: at most 10 extra letters per word

export function initTyping(tokens) {
  return {
    targets: tokens.map((t) => t.target),
    typed: tokens.map(() => ""),
    current: 0,
    startedAt: null,
    finishedAt: null,
    keyCorrect: 0,
    keyWrong: 0,
  };
}

export function typingReducer(s, a) {
  switch (a.type) {
    case "reset":
      return initTyping(a.tokens);

    case "char": {
      if (s.finishedAt) return s;
      const target = s.targets[s.current];
      const word = s.typed[s.current];
      if (word.length >= target.length + MAX_EXTRA) return s;

      const ok = word.length < target.length && target[word.length] === a.ch;
      const typed = s.typed.slice();
      typed[s.current] = word + a.ch;

      // last word typed perfectly -> test ends immediately (no space needed)
      const done =
        s.current === s.targets.length - 1 && typed[s.current] === target;
      return {
        ...s,
        typed,
        startedAt: s.startedAt ?? a.now,
        finishedAt: done ? a.now : null,
        keyCorrect: s.keyCorrect + (ok ? 1 : 0),
        keyWrong: s.keyWrong + (ok ? 0 : 1),
      };
    }

    case "space": {
      if (s.finishedAt) return s;
      const target = s.targets[s.current];
      const word = s.typed[s.current];
      if (word.length === 0) return s; // space on an empty word does nothing

      // targets such as "der Tisch" contain a real space: it is a normal character there
      if (word.length < target.length && target[word.length] === " ") {
        return typingReducer(s, { type: "char", ch: " ", now: a.now });
      }

      const ok = word === target;
      const next = {
        ...s,
        keyCorrect: s.keyCorrect + (ok ? 1 : 0),
        keyWrong: s.keyWrong + (ok ? 0 : 1),
      };
      return s.current === s.targets.length - 1
        ? { ...next, finishedAt: a.now }
        : { ...next, current: s.current + 1 };
    }

    case "backspace": {
      if (s.finishedAt) return s;
      const typed = s.typed.slice();
      const word = typed[s.current];

      if (word.length > 0) {
        typed[s.current] = a.word ? "" : word.slice(0, -1);
        return { ...s, typed };
      }
      // At the start of a word: step back, but only into a word that was wrong
      const prev = s.current - 1;
      if (prev >= 0 && typed[prev] !== s.targets[prev]) {
        if (a.word) typed[prev] = "";
        return { ...s, typed, current: prev };
      }
      return s;
    }

    default:
      return s;
  }
}

/** WPM / raw / accuracy / character breakdown, Monkeytype style. */
export function computeStats(s, at = s.finishedAt) {
  const empty = {
    wpm: 0,
    raw: 0,
    accuracy: 100,
    secs: 0,
    correctWords: 0,
    chars: { correct: 0, incorrect: 0, extra: 0, missed: 0 },
  };
  if (s.startedAt == null || at == null) return empty;

  const secs = Math.max((at - s.startedAt) / 1000, 0.05);

  // last word that has been touched (the user may have stepped back with backspace)
  let last = s.current;
  for (let i = s.targets.length - 1; i > last; i--) {
    if (s.typed[i]) {
      last = i;
      break;
    }
  }

  let correctWordChars = 0;
  let correctSpaces = 0;
  let allTyped = 0;
  let correctLetters = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;
  let correctWords = 0;

  for (let i = 0; i <= last; i++) {
    const w = s.targets[i];
    const t = s.typed[i];
    if (!t) continue;
    const spaceTyped = i < last;
    allTyped += t.length + (spaceTyped ? 1 : 0);

    if (t === w) {
      correctWords++;
      correctWordChars += w.length;
      correctLetters += w.length;
      if (spaceTyped) correctSpaces++;
    } else {
      for (let j = 0; j < Math.min(t.length, w.length); j++) {
        if (t[j] === w[j]) correctLetters++;
        else incorrect++;
      }
      extra += Math.max(0, t.length - w.length);
      missed += Math.max(0, w.length - t.length);
    }
  }

  const minutes = secs / 60;
  const keys = s.keyCorrect + s.keyWrong;
  return {
    wpm: Math.round((correctWordChars + correctSpaces) / 5 / minutes),
    raw: Math.round(allTyped / 5 / minutes),
    accuracy: keys ? Math.round((s.keyCorrect / keys) * 100) : 100,
    secs,
    correctWords,
    chars: {
      correct: correctLetters + correctSpaces,
      incorrect,
      extra,
      missed,
    },
  };
}
