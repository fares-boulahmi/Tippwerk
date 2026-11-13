import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import Icon from "../Icon.jsx";
import { computeStats, initTyping, typingReducer } from "./typingEngine.js";

// Row pitch in px = .tw height (44) + row gap (4). Must match --line-h in index.css.
const LINE_H = 48;

/**
 * tokens: [{ target: 'Haus', hint: 'house' }, ...]
 * Only `target` is typed; `hint` is rendered in the accent colour.
 * onFinish(stats) is called once, when the last word is done.
 */
export default function TypingTest({ tokens, onFinish }) {
  const [state, dispatch] = useReducer(typingReducer, tokens, initTyping);
  const [focused, setFocused] = useState(false);
  const [tick, setTick] = useState(0);

  const inputRef = useRef(null);
  const innerRef = useRef(null);
  const caretRef = useRef(null);
  const wordRefs = useRef([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const reported = useRef(false);
  const composing = useRef(false);
  const skipInput = useRef(false);

  const running = state.startedAt != null && !state.finishedAt;
  const now = () => performance.now();

  // ── focus handling ──
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const refocus = (e) => {
      if (
        document.activeElement !== inputRef.current &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.key.length === 1
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", refocus);
    return () => window.removeEventListener("keydown", refocus);
  }, []);

  // ── live wpm ticker ──
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick(now()), 400);
    return () => clearInterval(id);
  }, [running]);

  // ── report the result once ──
  useEffect(() => {
    if (state.finishedAt && !reported.current) {
      reported.current = true;
      onFinishRef.current(computeStats(state));
    }
  }, [state]);

  // ── caret position + line scrolling (direct DOM writes, no extra renders) ──
  const place = () => {
    const s = stateRef.current;
    const word = wordRefs.current[s.current];
    const inner = innerRef.current;
    const caret = caretRef.current;
    if (!word || !inner || !caret) return;

    // keep the active line as the 2nd visible row once we are past the first line
    const row = Math.round(word.offsetTop / LINE_H);
    inner.style.transform = `translateY(${-Math.max(0, row - 1) * LINE_H}px)`;

    const letters = word.querySelectorAll("[data-l]");
    const n = s.typed[s.current].length;
    const ref = letters[Math.min(n, letters.length - 1)];
    if (!ref) return;
    const x =
      n < letters.length ? ref.offsetLeft : ref.offsetLeft + ref.offsetWidth;
    caret.style.height = `${ref.offsetHeight}px`;
    caret.style.transform = `translate(${x}px, ${ref.offsetTop}px)`;
  };
  useLayoutEffect(place);
  useEffect(() => {
    document.fonts?.ready.then(place); // measure again once the mono font is loaded
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  // ── input ──
  const type = (ch) =>
    dispatch(
      ch === " "
        ? { type: "space", now: now() }
        : { type: "char", ch, now: now() },
    );

  const restart = () => {
    reported.current = false;
    dispatch({ type: "reset", tokens });
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      restart();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      dispatch({ type: "backspace", word: e.ctrlKey || e.altKey || e.metaKey });
    } else if (e.key === " " && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      type(" ");
    }
  };

  // Letters (incl. ä ö ü ß, dead keys, AltGr) arrive through `input`, not keydown.
  const onInput = (e) => {
    if (composing.current) return;
    const ne = e.nativeEvent;
    if (!skipInput.current && ne.data && ne.inputType === "insertText")
      for (const ch of ne.data) type(ch);
    e.currentTarget.value = "";
  };
  const onCompositionStart = () => {
    composing.current = true;
  };
  const onCompositionEnd = (e) => {
    composing.current = false;
    for (const ch of e.data || "") type(ch);
    e.currentTarget.value = "";
    skipInput.current = true; // Safari fires one more `input` right after compositionend
    setTimeout(() => (skipInput.current = false), 0);
  };

  const live = running ? computeStats(state, tick || now()) : null;

  return (
    <div className="w-full">
      {/* top row: progress + live wpm + restart */}
      <div className="flex items-center justify-between h-10 mb-3">
        <div className="font-mono text-2xl text-primary flex items-baseline gap-5">
          <span>
            {state.current}/{tokens.length}
          </span>
          <span className={live ? "" : "opacity-30"}>
            {live ? live.wpm : 0} <span className="text-sm">wpm</span>
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={restart}
          title="Restart (Esc)"
        >
          <Icon name="restart_alt" /> Restart
        </button>
      </div>

      {/* words */}
      <div
        className="relative cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none"
          aria-label="Typing input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
        />

        <div
          className={`typing-area transition ${focused ? "" : "blur-[3px] opacity-50"}`}
        >
          <div ref={innerRef} className="typing-inner">
            <div
              ref={caretRef}
              className={`caret ${state.startedAt ? "" : "caret-idle"}`}
            />

            {tokens.map((tok, i) => {
              const typed = state.typed[i];
              const target = tok.target;
              const wrong = i < state.current && typed !== target;
              const len = Math.max(target.length, typed.length);

              return (
                <div
                  key={i}
                  ref={(el) => (wordRefs.current[i] = el)}
                  className={`tw ${wrong ? "tw-wrong" : ""}`}
                >
                  <span className="tl-letters">
                    {Array.from({ length: len }, (_, j) => {
                      const ch = j < target.length ? target[j] : typed[j];
                      let cls = "tl-untyped";
                      if (j < typed.length)
                        cls =
                          j >= target.length
                            ? "tl-extra"
                            : typed[j] === target[j]
                              ? "tl-correct"
                              : "tl-wrong";
                      return (
                        <span key={j} data-l className={cls}>
                          {ch === " " ? "\u00A0" : ch}
                        </span>
                      );
                    })}
                  </span>
                  {tok.hint && <span className="tl-hint">{tok.hint}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {!focused && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-base-content/70 pointer-events-none">
            <Icon name="ads_click" /> Click here or press any key to focus
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-base-content/50 flex flex-wrap gap-x-5 gap-y-2 items-center">
        <span>
          <kbd className="kbd kbd-xs">space</kbd> next word
        </span>
        <span>
          <kbd className="kbd kbd-xs">ctrl</kbd> +{" "}
          <kbd className="kbd kbd-xs">⌫</kbd> delete word
        </span>
        <span>
          <kbd className="kbd kbd-xs">esc</kbd> restart
        </span>
      </p>
    </div>
  );
}
