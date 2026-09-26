import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material" },
    questions: { type: Array, default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
