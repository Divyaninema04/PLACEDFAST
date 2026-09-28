import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { RoadmapProgress } from "../models/RoadmapProgress.js";

export async function getRoadmapProgressHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    const progressList = await RoadmapProgress.find({ userId });
    res.json({ success: true, data: progressList });
  } catch (err) {
    next(err);
  }
}

export async function upsertRoadmapProgressHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    const { id, stage_key, stageKey, progress, completed_milestones, completedMilestones } = req.body;
    const key = stage_key || stageKey;

    if (!key && !id) {
      res.status(400).json({ success: false, error: "stageKey or id is required" });
      return;
    }

    const update: Record<string, unknown> = {};
    if (progress !== undefined) update.progress = Number(progress);
    if (completed_milestones !== undefined) update.completedMilestones = completed_milestones;
    if (completedMilestones !== undefined) update.completedMilestones = completedMilestones;
    if (key) update.stageKey = key;

    let item;
    if (id) {
      item = await RoadmapProgress.findOneAndUpdate(
        { _id: id, userId },
        { $set: update },
        { new: true, upsert: true, runValidators: true },
      );
    } else {
      item = await RoadmapProgress.findOneAndUpdate(
        { userId, stageKey: key },
        { $set: update },
        { new: true, upsert: true, runValidators: true },
      );
    }

    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}
