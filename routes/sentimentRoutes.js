import express from "express";
import { getSentiment } from "../controllers/sentimentController.js";
const router = express.Router();

router.get("/:teamId", getSentiment);

export default router;
