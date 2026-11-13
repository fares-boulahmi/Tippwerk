import mongoose from "mongoose";
import Collection from "../models/Collection.js";
import TypingSet from "../models/TypingSet.js";
import { HttpError } from "../utils/HttpError.js";
import { cleanSentences, cleanWords } from "../utils/validate.js";

// POST /api/collections/:id/sets  { title?, words: [[w, t], ...], sentences: [s, ...] }
export async function createSet(req, res) {
  const { id } = req.params;
  const words = cleanWords(req.body.words ?? []);
  const sentences = cleanSentences(req.body.sentences ?? []);
  if (!words.length && !sentences.length) {
    throw new HttpError(400, "A set needs at least one word or one sentence");
  }
  const title = String(req.body.title || "")
    .trim()
    .slice(0, 120);

  const newId = new mongoose.Types.ObjectId();

  // 1) Atomically make the new set the collection's `lastSet`.
  //    `new: false` returns the collection as it was BEFORE the update,
  //    so `before.lastSet` is the previous last set (null if this is the first one).
  const before = await Collection.findOneAndUpdate(
    { _id: id },
    { $set: { lastSet: newId }, $inc: { setsCount: 1 } },
    { new: false },
  );
  if (!before) throw new HttpError(404, "Collection not found");

  try {
    // 2) Create the set, pointing back to the previous last set.
    // shuffle the words and sentences  so they appear more
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const repeatedWords = [...words, ...shuffle(words)];
    const repeatedSentences = [
      ...sentences,
      ...shuffle(sentences),
      ...shuffle(sentences),
    ];

    const set = await TypingSet.create({
      _id: newId,
      collectionId: id,
      title,
      words: repeatedWords,
      sentences: repeatedSentences,
      previousSet: before.lastSet,
      position: before.setsCount + 1,
    });

    // 3) Point the previous last set forward to the new one...
    if (before.lastSet) {
      await TypingSet.updateOne({ _id: before.lastSet }, { nextSet: newId });
    } else {
      // ...or, for the very first set, also fill `firstSet`.
      await Collection.updateOne(
        { _id: id, firstSet: null },
        { firstSet: newId },
      );
    }

    res.status(201).json(set);
  } catch (err) {
    // Undo step 1 so the collection never points at a set that doesn't exist
    await Collection.updateOne(
      { _id: id, lastSet: newId },
      { $set: { lastSet: before.lastSet }, $inc: { setsCount: -1 } },
    );
    throw err;
  }
}
