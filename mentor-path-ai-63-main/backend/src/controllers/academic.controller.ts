import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { Semester } from "../models/Semester.js";
import { Subject } from "../models/Subject.js";

// ================= Semesters =================
export async function getSemestersHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const semesters = await Semester.find({ userId }).sort({ number: 1 });
    res.json({ success: true, data: semesters });
  } catch (err) {
    next(err);
  }
}

export async function upsertSemesterHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const { id, number, label, gpa, credits, status, backlogs_count, backlogsCount } = req.body;

    const data = {
      userId,
      number: Number(number),
      label,
      gpa: gpa != null ? Number(gpa) : undefined,
      credits: credits != null ? Number(credits) : 20,
      status: status || "ongoing",
      backlogsCount: Number(backlogsCount ?? backlogs_count ?? 0),
    };

    let semester;
    if (id) {
      semester = await Semester.findByIdAndUpdate(id, { $set: data }, { new: true });
    } else {
      semester = await Semester.findOneAndUpdate({ userId, number: data.number }, { $set: data }, { upsert: true, new: true });
    }

    res.json({ success: true, data: semester });
  } catch (err) {
    next(err);
  }
}

export async function deleteSemesterHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await Semester.findByIdAndDelete(id);
    res.json({ success: true, message: "Semester deleted" });
  } catch (err) {
    next(err);
  }
}

// ================= Subjects =================
export async function getSubjectsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const subjects = await Subject.find({ userId }).sort({ createdAt: 1 });
    res.json({ success: true, data: subjects });
  } catch (err) {
    next(err);
  }
}

export async function createSubjectHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const { name, code, credits, progress, interview_topics, interviewTopics, semester_id, semesterId } = req.body;

    const subject = await Subject.create({
      userId,
      semesterId: semesterId || semester_id,
      name,
      code,
      credits: Number(credits) || 4,
      progress: Number(progress) || 0,
      interviewTopics: interviewTopics || interview_topics || [],
    });

    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
}

export async function updateSubjectHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.interview_topics) updateData.interviewTopics = updateData.interview_topics;
    if (updateData.semester_id) updateData.semesterId = updateData.semester_id;

    const subject = await Subject.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    res.json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
}

export async function deleteSubjectHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await Subject.findByIdAndDelete(id);
    res.json({ success: true, message: "Subject deleted" });
  } catch (err) {
    next(err);
  }
}
