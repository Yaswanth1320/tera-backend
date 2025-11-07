import Task from "../models/Task.js";
import Analytics from "../models/Analytics.js";

export async function updateAnalytics() {
  const total = await Task.countDocuments();
  const open = await Task.countDocuments({ status: "open" });
  const inProgress = await Task.countDocuments({ status: "in_progress" });
  const completed = await Task.countDocuments({ status: "completed" });
  const blocked = await Task.countDocuments({ status: "blocked" });

  const closedToday = await Task.countDocuments({
    status: "completed",
    closedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  const analytics = new Analytics({
    openTasks: open,
    inProgress,
    completed,
    blocked,
    closedToday,
    completionRate: ((completed / total) * 100).toFixed(2),
  });
  await analytics.save();
}
