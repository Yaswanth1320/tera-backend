// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String }, // initials or avatar URL
  role: { type: String, enum: ["developer", "manager", "tester", "designer"], default: "developer" },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  performance: {
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    open: { type: Number, default: 0 },
    blocked: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
