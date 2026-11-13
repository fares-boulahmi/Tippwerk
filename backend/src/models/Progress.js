import mongoose from "mongoose";

const { Schema } = mongoose;

// Where a user is inside ONE collection.
const progressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
      required: true,
    },
    currentSet: {
      type: Schema.Types.ObjectId,
      ref: "TypingSet",
      required: true,
    },

    mode: { type: String, enum: ["words", "sentences"], default: "words" }, // what he types right now
    index: { type: Number, default: 0, min: 0 }, // start index inside that mode's array
    completed: { type: Boolean, default: false }, // finished the last set
  },
  { timestamps: true },
);

progressSchema.index({ user: 1, collectionId: 1 }, { unique: true });

export default mongoose.model("Progress", progressSchema);
