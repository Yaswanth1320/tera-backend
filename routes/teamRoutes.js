import express from "express";
import { getTeams, getTeamPerformance } from "../controllers/teamController.js";
const router = express.Router();

router.get("/", getTeams);
router.get("/performance", getTeamPerformance);

export default router;
