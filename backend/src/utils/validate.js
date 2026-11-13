import { LIMITS } from "../config/constants.js";
import { HttpError } from "./HttpError.js";

const clean = (v) =>
  typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "";

/** [[word, translation], ...] -> trimmed, validated pairs */
export function cleanWords(input) {
  if (!Array.isArray(input)) throw new HttpError(400, "words must be an array");
  if (input.length > LIMITS.maxWords)
    throw new HttpError(400, `Max ${LIMITS.maxWords} words per set`);

  return input.map((pair, i) => {
    if (!Array.isArray(pair) || pair.length !== 2) {
      throw new HttpError(400, `Word #${i + 1} must be [word, translation]`);
    }
    const [word, translation] = pair.map(clean);
    if (!word || !translation)
      throw new HttpError(400, `Word #${i + 1} has an empty side`);
    if (word.length > LIMITS.maxWordLength)
      throw new HttpError(400, `Word #${i + 1} is too long`);
    return [word, translation];
  });
}

/** ["sentence", ...] -> trimmed, non-empty sentences */
export function cleanSentences(input) {
  if (!Array.isArray(input))
    throw new HttpError(400, "sentences must be an array");
  if (input.length > LIMITS.maxSentences)
    throw new HttpError(400, `Max ${LIMITS.maxSentences} sentences per set`);

  return input.map((s, i) => {
    const sentence = clean(s);
    if (!sentence) throw new HttpError(400, `Sentence #${i + 1} is empty`);
    if (sentence.length > LIMITS.maxSentenceLength)
      throw new HttpError(400, `Sentence #${i + 1} is too long`);
    return sentence;
  });
}
