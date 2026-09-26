import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material" },
    cards: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Flashcard", flashcardSchema);
