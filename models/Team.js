// models/Team.js
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalTasks: { type: Number, default: 0 },
  velocity: { type: Number, default: 0 }, // tasks per week
  efficiency: { type: Number, default: 0 }, // %
  rank: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);
