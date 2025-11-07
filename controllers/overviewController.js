
import Task from "../models/Task.js";

export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

    // --- Basic Metrics ---
    const [
      openTasks,
      inProgress,
      closedToday,
      closedThisHour,
      totalTasks,
      completedTasks,
    ] = await Promise.all([
      Task.countDocuments({ status: "open" }),
      Task.countDocuments({ status: "in_progress" }),
      Task.countDocuments({ status: "completed", updatedAt: { $gte: startOfToday } }),
      Task.countDocuments({ status: "completed", updatedAt: { $gte: startOfHour } }),
      Task.countDocuments({}),
      Task.countDocuments({ status: "completed" }),
    ]);

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // --- Donut Chart: Distribution by Status ---
    const taskStats = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // --- Line Chart: 7-Day Trend ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const trendData = await Task.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          tasksCreated: { $sum: 1 },
          tasksCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          tasksInProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          tasksCreated: 1,
          tasksCompleted: 1,
          tasksInProgress: 1,
        },
      },
    ]);

    res.json({
      overview: {
        openTasks,
        inProgress,
        closedToday,
        closedThisHour,
        completionRate,
        trendData,
      },
      taskStats,
    });
  } catch (err) {
    console.error("Error fetching overview:", err);
    res.status(500).json({ message: err.message });
  }
};


