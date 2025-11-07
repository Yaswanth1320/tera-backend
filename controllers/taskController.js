import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const tasks = await Task.find(filter).populate("assignedTo project team");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserTaskStats = async (req, res) => {
  try {
    // Aggregate task counts per user
    const pipeline = [
      {
        $group: {
          _id: "$assignedTo",
          assigned: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          blocked: { $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          assigned: 1,
          completed: 1,
          inProgress: 1,
          open: 1,
          blocked: 1,
        },
      },
      { $sort: { assigned: -1 } },
    ];

    const stats = await Task.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    console.error("Error fetching user task stats:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add this function below getUserTaskStats

export const getTaskTrends = async (req, res) => {
  try {
    // Group tasks by date (day precision)
    const pipeline = [
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
    ];

    const trend = await Task.aggregate(pipeline);
    res.json(trend);
  } catch (err) {
    console.error("Error fetching task trends:", err);
    res.status(500).json({ message: err.message });
  }
};
