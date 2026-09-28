import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { callGateway, type ChatMessage } from "../services/ai.service.js";
import { User } from "../models/User.js";
import { Subject } from "../models/Subject.js";
import { Application } from "../models/Application.js";
import { RoadmapProgress } from "../models/RoadmapProgress.js";

export async function chatMentorHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      res.status(400).json({ success: false, error: "Messages array is required" });
      return;
    }

    const sanitizedMessages: ChatMessage[] = messages.slice(-20).map((m: Record<string, unknown>) => ({
      role: (m.role === "system" || m.role === "assistant" ? m.role : "user") as "system" | "user" | "assistant",
      content: String(m.content ?? "").slice(0, 4000),
    }));

    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Fetch 10-source student context: profile, academics, applications, roadmap using Mongoose
    const profile = await User.findById(userId).select(
      "name email college branch degree course yearOfStudy cgpa skills achievements dreamCompanies preferredRoles currentSemester",
    );

    const subjects = await Subject.find({ userId })
      .select("name progress interviewTopics")
      .limit(10);

    const applications = await Application.find({ userId })
      .select("companyName role status packageLpa")
      .limit(10);

    const roadmapProgress = await RoadmapProgress.find({ userId })
      .select("stageKey progress completedMilestones")
      .limit(10);

    const system = `You are PlacementPilot AI Mentor — an evidence-grounded AI career coach for Indian students preparing for placements & internships.

CRITICAL INSTRUCTION (Section 19):
You MUST strictly distinguish between:
1. [VERIFIED DATA]: Grounded strictly in official university records, profile data, or verified campus MoUs.
2. [PLATFORM CALCULATION]: Platform-computed metrics (e.g. 8-factor skill gap severities, match percentages, deficit percentages).
3. [AI RECOMMENDATION]: Your forward-looking actionable advice, learning suggestions, and prep tactics.

NEVER present fabricated external facts as verified facts. If data is unknown or missing, explicitly state it is not recorded.

STUDENT CONTEXT (From Platform):
- Profile: ${JSON.stringify(profile ?? {})}
- Academics (Subjects & Interview Topics): ${JSON.stringify(subjects ?? [])}
- Applications Tracked: ${JSON.stringify(applications ?? [])}
- Roadmap Progress: ${JSON.stringify(roadmapProgress ?? [])}
- Target Role Benchmarks: Data Analyst, Cloud/DevOps Engineer, Full Stack Developer
- Key Market Gaps Detected: SQL Window Functions (Advanced needed vs Basic possessed), Power BI & DAX (Intermediate needed vs None possessed).

Format your response clearly into sections:
### [VERIFIED DATA]
(List facts verified from profile, coursework, or verified employer requisitions)

### [PLATFORM CALCULATION]
(List empirical gap calculations, match percentages, or salary deltas)

### [AI RECOMMENDATION]
(List concrete, prioritized next steps, study hours, or portfolio targets)`;

    const result = await callGateway({
      messages: [{ role: "system", content: system }, ...sanitizedMessages],
    });

    const reply = result.choices?.[0]?.message?.content ?? "";
    res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
}
