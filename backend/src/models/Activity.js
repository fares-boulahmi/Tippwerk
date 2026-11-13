import mongoose from "mongoose";

const { Schema } = mongoose;

// One row per user per day -> feeds the GitHub-style contribution graph.
const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD' in the user's local time (sent by the client)
  sessions: { type: Number, default: 0 },
  words: { type: Number, default: 0 },
  chars: { type: Number, default: 0 },
  bestWpm: { type: Number, default: 0 },
});

activitySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Activity", activitySchema);
