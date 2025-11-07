import Sentiment from "../models/Sentiment.js";

export const getSentiment = async (req, res) => {
  try {
    const sentiment = await Sentiment.findOne({ team: req.params.teamId });
    res.json(sentiment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
