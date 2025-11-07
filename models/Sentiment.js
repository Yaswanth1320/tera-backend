// models/Sentiment.js
import mongoose from "mongoose";

const sentimentSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  positive: { type: Number, default: 0 },
  neutral: { type: Number, default: 0 },
  negative: { type: Number, default: 0 },
  insight: { type: String },
}, { timestamps: true });

export default mongoose.model("Sentiment", sentimentSchema);
