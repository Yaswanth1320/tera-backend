// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["API Services", "Mobile App", "Web Platform"], required: true },
  totalTasks: { type: Number, default: 0 },
  openTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  blockedTasks: { type: Number, default: 0 },
  progressRate: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
