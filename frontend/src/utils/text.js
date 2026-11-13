/** Session payload from the API -> the tokens the typing test renders. */
export function toTokens(session) {
  if (session.mode === "words") {
    // [word, translation]: only index 0 is typed, index 1 is shown as a coloured hint
    return session.items.map(([target, hint]) => ({ target, hint }));
  }
  // sentences: type them word by word, punctuation included
  return session.items.flatMap((sentence) =>
    sentence
      .split(/\s+/)
      .filter(Boolean)
      .map((target) => ({ target })),
  );
}

// "der Tisch | the table"  (also accepts =  ;  tab  or " - " as separator)
const SEPARATOR = /\s*(?:\||=|;|\t| - )\s*/;

export function parseWords(text) {
  const pairs = [];
  const badLines = [];
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const m = SEPARATOR.exec(line);
    const word = m ? line.slice(0, m.index).trim() : "";
    const translation = m ? line.slice(m.index + m[0].length).trim() : "";
    if (word && translation) pairs.push([word, translation]);
    else badLines.push(i + 1);
  });
  return { pairs, badLines };
}

export const parseSentences = (text) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
