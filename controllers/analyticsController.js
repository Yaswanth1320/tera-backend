import Analytics from "../models/Analytics.js";

export const getTrendAnalysis = async (req, res) => {
  try {
    const trends = await Analytics.find().sort({ date: 1 }).limit(7);
    res.json(trends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
