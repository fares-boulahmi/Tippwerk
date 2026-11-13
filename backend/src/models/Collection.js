import mongoose from "mongoose";

const { Schema } = mongoose;
const setRef = { type: Schema.Types.ObjectId, ref: "TypingSet", default: null };

const collectionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 120,
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Both are null on creation. The first set created fills both,
    // every later set only moves `lastSet`.
    firstSet: setRef,
    lastSet: setRef,
    setsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Collection", collectionSchema);
