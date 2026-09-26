import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goal: { type: String, required: true },
    plan: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("StudyPlan", studyPlanSchema);
