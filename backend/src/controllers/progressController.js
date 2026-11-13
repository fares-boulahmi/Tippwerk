import { CHUNK_SIZE } from "../config/constants.js";
import Activity from "../models/Activity.js";
import Collection from "../models/Collection.js";
import Progress from "../models/Progress.js";
import TypingSet from "../models/TypingSet.js";
import { HttpError } from "../utils/HttpError.js";
import { buildSession, settle } from "../utils/progressEngine.js";

const loadSet = (id) => TypingSet.findById(id).lean();

async function findCollection(id) {
  const collection = await Collection.findById(id).lean();
  if (!collection) throw new HttpError(404, "Collection not found");
  if (!collection.firstSet)
    throw new HttpError(409, "This collection has no sets yet");
  return collection;
}

async function getOrCreateProgress(userId, collection) {
  return (
    (await Progress.findOne({ user: userId, collectionId: collection._id })) ||
    new Progress({
      user: userId,
      collectionId: collection._id,
      currentSet: collection.firstSet,
    })
  );
}

// Normalise the pointer (skip empty arrays, hop to next set, ...), save it, build the payload.
async function resolveSession(progress, collection) {
  const current = await loadSet(progress.currentSet);
  const { set, done } = await settle(progress, current, loadSet);
  await progress.save();
  return buildSession(collection, progress, set, done);
}

// GET /api/progress/:collectionId/session
export async function getSession(req, res) {
  const collection = await findCollection(req.params.collectionId);
  const progress = await getOrCreateProgress(req.user._id, collection);
  res.json(await resolveSession(progress, collection));
}

const num = (v, max) => Math.min(Math.max(Math.round(Number(v)) || 0, 0), max);

// POST /api/progress/:collectionId/complete
// body: { mode, index, wpm, accuracy, chars, wordCount, date: 'YYYY-MM-DD' }
export async function completeSession(req, res) {
  const collection = await findCollection(req.params.collectionId);
  const progress = await getOrCreateProgress(req.user._id, collection);
  const { mode, index } = req.body;

  // Duplicate / stale submit (double click, second tab...) -> tell the client where it really is.
  if (
    progress.completed ||
    progress.mode !== mode ||
    progress.index !== Number(index)
  ) {
    throw new HttpError(409, "Progress out of sync", {
      session: await resolveSession(progress, collection),
    });
  }

  // words: +15, sentences: +3. settle() then decides if we flip to sentences / next set.
  progress.index += CHUNK_SIZE[mode];

  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.body.date)
    ? req.body.date
    : new Date().toISOString().slice(0, 10);
  await Activity.updateOne(
    { user: req.user._id, date },
    {
      $inc: {
        sessions: 1,
        words: num(req.body.wordCount, 1000),
        chars: num(req.body.chars, 20000),
      },
      $max: { bestWpm: num(req.body.wpm, 400) },
    },
    { upsert: true },
  );

  res.json(await resolveSession(progress, collection));
}

// GET /api/progress/activity  -> roughly the last year, one row per active day
export async function getActivity(req, res) {
  const cutoff = new Date(Date.now() - 370 * 864e5).toISOString().slice(0, 10);
  const activity = await Activity.find({
    user: req.user._id,
    date: { $gte: cutoff },
  })
    .select("date sessions words chars bestWpm -_id")
    .sort({ date: 1 })
    .lean();
  res.json({ activity });
}
