import createClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";
import Task from "../models/Task.js";
import Team from "../models/Team.js";

dotenv.config();

const endpoint = "https://models.github.ai/inference";
const model = "gpt-4o-mini";

export const getAIInsights = async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(500).json({ error: "Missing GITHUB_TOKEN" });
    }

    // 1️⃣ Fetch real data from DB
    const [tasks, teams] = await Promise.all([
      Task.find().populate("assignedTo project team"),
      Team.find(),
    ]);

    // 2️⃣ Summarize data
    const teamSummary = teams
      .map(
        (t) =>
          `${t.name}: ${t.tasksCompleted} completed, ${t.tasksInProgress} in progress, velocity ${t.velocity || 0} tasks/week`
      )
      .join("\n");

    const taskSummary = tasks
      .slice(0, 50)
      .map(
        (t) =>
          `${t.title} (${t.status}) - ${t.assignedTo?.name || "Unassigned"} [${t.project?.name || "No Project"}]`
      )
      .join("\n");

    // 3️⃣ Build the prompt
    const context = `
You are an AI productivity analyst.
Analyze the team's performance and task trends from the data below.

TEAM PERFORMANCE:
${teamSummary}

TASK DATA:
${taskSummary}

Provide:
1. A short benchmarking summary (performance differences, ranking)
2. A predictive performance analysis for the next sprint
3. Key risks or blockers if visible.
Return JSON with:
{
  "summary": "...",
  "benchmarking": "...",
  "predictions": "...",
  "riskLevel": "Low/Medium/High"
}
`;

    // 4️⃣ Send data to model
    const client = createClient(endpoint, new AzureKeyCredential(token));
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [{ role: "system", content: context }],
        model,
        temperature: 0.7,
      },
    });

    if (isUnexpected(response)) {
      console.error(response.body?.error);
      return res.status(500).json({ error: response.body?.error?.message });
    }

    const reply = response.body?.choices?.[0]?.message?.content || "{}";

    // 5️⃣ Parse AI response safely
    let insights;
    try {
      insights = JSON.parse(reply);
    } catch {
      insights = { summary: reply };
    }

    res.json({ insights, teams });
  } catch (err) {
    console.error("AI Insights error:", err);
    res.status(500).json({ error: err.message });
  }
};
