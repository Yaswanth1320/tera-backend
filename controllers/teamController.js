import Team from "../models/Team.js";
import User from "../models/User.js";

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ rank: 1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeamPerformance = async (req, res) => {
  try {
    const users = await User.find().populate("team");
    const performance = users.map(u => ({
      name: u.name,
      completed: u.performance.completed,
      inProgress: u.performance.inProgress,
      open: u.performance.open,
    }));
    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
