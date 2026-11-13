import { CHUNK_SIZE } from "../config/constants.js";

/**
 * Moves the user's pointer forward until it lands on something typeable.
 *
 *  - index >= words.length      -> sentences turn, index = 0
 *  - index >= sentences.length  -> go to the next set (words, index = 0)
 *  - no next set                -> the collection is completed
 *
 * It loops, so empty arrays (a set with no words, or no sentences) are skipped.
 * `loadSet(id)` is injected so this stays easy to unit-test.
 */
export async function settle(progress, set, loadSet) {
  progress.completed = false;

  while (set) {
    if (progress.index < set[progress.mode].length) return { set, done: false };

    if (progress.mode === "words") {
      progress.mode = "sentences";
      progress.index = 0;
      continue;
    }

    if (!set.nextSet) break; // last set, sentences exhausted

    set = await loadSet(set.nextSet);
    if (set)
      Object.assign(progress, { currentSet: set._id, mode: "words", index: 0 });
  }

  progress.completed = true;
  return { set, done: true };
}

/** The payload the typing page needs for the user's current session. */
export function buildSession(collection, progress, set, done) {
  const base = {
    collection: {
      id: collection._id,
      title: collection.title,
      setsCount: collection.setsCount,
    },
  };
  if (done) return { ...base, completed: true };

  const size = CHUNK_SIZE[progress.mode];
  const list = set[progress.mode];

  return {
    ...base,
    completed: false,
    mode: progress.mode,
    index: progress.index,
    size,
    total: list.length,
    set: { id: set._id, title: set.title, position: set.position },
    items: list.slice(progress.index, progress.index + size),
  };
}
