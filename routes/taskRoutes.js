import express from "express";
import { getTasks, createTask, updateTaskStatus, getUserTaskStats, getTaskTrends } from "../controllers/taskController.js";
const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id/status", updateTaskStatus);
router.get("/user-stats", getUserTaskStats); // ✅ correct
router.get("/trends", getTaskTrends); // ✅ new endpoint

export default router;
