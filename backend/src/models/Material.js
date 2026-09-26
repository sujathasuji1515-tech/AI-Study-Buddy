import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    subject: { type: String, default: "" },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Material", materialSchema);
