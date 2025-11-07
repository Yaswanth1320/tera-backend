import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    const openIssues = await Task.aggregate([
      { $match: { status: "open" } },
      { $group: { _id: "$project", count: { $sum: 1 } } },
    ]);
    res.json({ projects, openIssues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
