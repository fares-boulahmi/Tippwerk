import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    picture: { type: String, default: "" },
    // Proof of concept: everybody is an admin. Flip the default to 'user' later.
    role: { type: String, enum: ["admin", "user"], default: "admin" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
