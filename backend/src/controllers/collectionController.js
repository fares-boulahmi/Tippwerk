import Collection from "../models/Collection.js";
import Progress from "../models/Progress.js";
import TypingSet from "../models/TypingSet.js";
import { HttpError } from "../utils/HttpError.js";

const summarize = (p) =>
  p && {
    mode: p.mode,
    index: p.index,
    completed: p.completed,
    setId: p.currentSet?._id ?? null,
    setPosition: p.currentSet?.position ?? null,
  };

// GET /api/collections  (every user sees every collection, plus their own progress)
export async function listCollections(req, res) {
  const collections = await Collection.find().sort({ createdAt: -1 }).lean();

  const progress = await Progress.find({
    user: req.user._id,
    collectionId: { $in: collections.map((c) => c._id) },
  })
    .populate("currentSet", "position title")
    .lean();
  const byCollection = new Map(
    progress.map((p) => [String(p.collectionId), p]),
  );

  res.json(
    collections.map((c) => ({
      ...c,
      progress: summarize(byCollection.get(String(c._id))),
    })),
  );
}

// POST /api/collections  { title, description }
export async function createCollection(req, res) {
  const title = String(req.body.title || "").trim();
  if (!title) throw new HttpError(400, "Title is required");
  const description = String(req.body.description || "").trim();

  // firstSet / lastSet start as null (schema defaults)
  const collection = await Collection.create({
    title,
    description,
    createdBy: req.user._id,
  });
  res.status(201).json(collection);
}

// GET /api/collections/:id  -> collection + its sets in order (counts only) + my progress
export async function getCollection(req, res) {
  const collection = await Collection.findById(req.params.id).lean();
  if (!collection) throw new HttpError(404, "Collection not found");

  const [sets, progress] = await Promise.all([
    TypingSet.find({ collectionId: collection._id })
      .sort({ position: 1 })
      .select("title position words sentences previousSet nextSet")
      .lean(),
    Progress.findOne({ user: req.user._id, collectionId: collection._id })
      .populate("currentSet", "position title")
      .lean(),
  ]);

  res.json({
    ...collection,
    sets: sets.map(({ words, sentences, ...set }) => ({
      ...set,
      wordsCount: words.length,
      sentencesCount: sentences.length,
    })),
    progress: summarize(progress),
  });
}
