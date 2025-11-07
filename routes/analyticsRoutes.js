import express from "express";
import { getTrendAnalysis } from "../controllers/analyticsController.js";
const router = express.Router();

router.get("/trends", getTrendAnalysis);

export default router;
