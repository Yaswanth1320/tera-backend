import express from "express";
import createClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

dotenv.config();

const router = express.Router();
const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o-mini"; // ✅ Supported model

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array." });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Missing GITHUB_TOKEN in environment variables." });
    }

    // ✅ Step 1: Fetch data from MongoDB
    const [tasks, projects, users] = await Promise.all([
      Task.find().populate("assignedTo project team").limit(20),
      Project.find().limit(10),
      User.find().limit(10),
    ]);

    // ✅ Step 2: Build summarized context
    const taskSummary = tasks
      .map(
        (t) =>
          `• ${t.title} — ${t.status} (Project: ${t.project?.name || "N/A"}, Assigned to: ${
            t.assignedTo?.name || "Unassigned"
          })`
      )
      .join("\n");

    const projectSummary = projects
      .map(
        (p) =>
          `• ${p.name} — ${p.status || "unknown"} (${p.tasks?.length || 0} tasks)`
      )
      .join("\n");

    const userSummary = users
      .map(
        (u) =>
          `• ${u.name} (${u.role || "employee"}) — ${u.email}`
      )
      .join("\n");

    const context = `
You are an assistant for a task management system.

Here is the current company data snapshot:
🧩 **Projects**
${projectSummary}

📋 **Tasks**
${taskSummary}

👥 **Users**
${userSummary}

Use this information to answer user questions accurately.
If you don’t know something or it’s not in the data, say “I don’t have that information right now.”
`;

    // ✅ Step 3: Prepare messages with context as the system prompt
    const chatMessages = [
      { role: "system", content: context },
      ...messages,
    ];

    // ✅ Step 4: Initialize model client and send the request
    const client = createClient(endpoint, new AzureKeyCredential(token));
    const response = await client.path("/chat/completions").post({
      body: {
        messages: chatMessages,
        model,
      },
    });

    // ✅ Handle model response
    if (isUnexpected(response)) {
      console.error("Model error:", response.body?.error);
      return res.status(500).json({
        error: response.body?.error?.message || "Unexpected model error",
      });
    }

    const reply =
      response.body?.choices?.[0]?.message?.content ||
      "⚠️ No response generated.";

    res.json({ reply });
  } catch (err) {
    console.error("🔥 AI route error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

export default router;
