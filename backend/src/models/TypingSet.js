import mongoose from "mongoose";

const { Schema } = mongoose;

const isPair = (p) =>
  Array.isArray(p) &&
  p.length === 2 &&
  p.every((s) => typeof s === "string" && s.trim().length > 0);

const typingSetSchema = new Schema(
  {
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
      index: true,
    },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    position: { type: Number, required: true }, // 1-based order inside the collection

    // [[wordToType, translation], ...]  -> index 0 is typed, index 1 is only a hint
    words: {
      type: [[String]],
      default: [],
      validate: {
        validator: (list) => list.every(isPair),
        message: "Every word must be [word, translation]",
      },
    },
    // ["Sentence one.", "Sentence two.", ...]  -> typed as-is
    sentences: { type: [String], default: [] },

    // Doubly linked list inside the collection
    previousSet: {
      type: Schema.Types.ObjectId,
      ref: "TypingSet",
      default: null,
    }, // null for the first set
    nextSet: { type: Schema.Types.ObjectId, ref: "TypingSet", default: null }, // null for the last set
  },
  { timestamps: true },
);

export default mongoose.model("TypingSet", typingSetSchema);
