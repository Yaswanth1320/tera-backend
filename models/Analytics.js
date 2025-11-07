// models/Analytics.js
import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  openTasks: Number,
  inProgress: Number,
  completed: Number,
  blocked: Number,
  closedToday: Number,
  closedThisHour: Number,
  completionRate: Number,
  trendData: [
    {
      date: Date,
      tasksCompleted: Number,
      tasksCreated: Number,
      tasksInProgress: Number,
    },
  ],
}, { timestamps: true });

export default mongoose.model("Analytics", analyticsSchema);
