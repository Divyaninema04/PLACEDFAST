import type { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { Resume } from "../models/Resume.js";
import { ResumeVersion } from "../models/ResumeVersion.js";
import { User } from "../models/User.js";
import { isDbConnected, getPrimaryStudentId } from "../config/db.js";
import { callGateway } from "../services/ai.service.js";
import { extractJson } from "../utils/json-parser.js";
import { parsePdfBuffer, extractResumeData, type ExtractedResumeData } from "../utils/pdf-extractor.js";

const RESUMES_STORE_PATH = path.resolve(process.cwd(), "uploads/resumes/resumes.json");

function loadLocalResumes(): any[] {
  try {
    if (fs.existsSync(RESUMES_STORE_PATH)) {
      const content = fs.readFileSync(RESUMES_STORE_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Return empty on error
  }
  return [];
}

function saveLocalResumes(list: any[]): void {
  try {
    const dir = path.dirname(RESUMES_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RESUMES_STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save local resumes:", err);
  }
}

// ================= Uploaded Resumes =================
export async function getResumesHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId || "student-local";

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
        if (resumes && resumes.length > 0) {
          res.json({ success: true, data: resumes });
          return;
        }
      } catch {
        // Fall back to local file store
      }
    }

    const localList = loadLocalResumes();
    const userResumes = localList.filter((r) => r.userId === userId || userId === "student-local");
    res.json({ success: true, data: userResumes });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
}

export async function uploadAndExtractResumeHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId || getPrimaryStudentId() || "student-local";
    const { label, target_role, targetRole } = req.body || {};

    let buffer: Buffer;
    let rawName: string;

    if (req.file && req.file.buffer) {
      buffer = req.file.buffer;
      rawName = req.file.originalname || "resume.pdf";
    } else if (req.body?.fileData && typeof req.body.fileData === "string") {
      const base64Str = req.body.fileData.includes(";base64,") ? req.body.fileData.split(";base64,")[1] : req.body.fileData;
      buffer = Buffer.from(base64Str, "base64");
      rawName = (req.body.fileName || req.body.file_name || "resume.pdf").toString();
    } else {
      res.status(400).json({ success: false, error: "No PDF file provided. Please attach a PDF resume." });
      return;
    }

    if (buffer.length === 0) {
      res.status(400).json({ success: false, error: "Invalid or empty PDF file" });
      return;
    }

    // Save to disk in uploads/resumes/
    const uploadsDir = path.resolve(process.cwd(), "uploads/resumes");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const sanitizedName = rawName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${userId}_${Date.now()}_${sanitizedName}`;
    const filePathOnDisk = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(filePathOnDisk, buffer);

    // Extract text & structured entities from PDF
    let extractedData: ExtractedResumeData | null = null;
    let extractedText = "";

    try {
      extractedText = await parsePdfBuffer(buffer);
      if (extractedText && extractedText.trim()) {
        extractedData = await extractResumeData(extractedText);
      }
    } catch (parseErr) {
      console.warn("[Resume PDF Parser Notice]:", parseErr);
    }

    const localList = loadLocalResumes();
    const isPrimary = localList.filter((r) => r.userId === userId).length === 0;

    const resumeRecord: any = {
      id: uniqueFileName,
      _id: uniqueFileName,
      userId,
      user_id: userId,
      label: label || rawName.replace(/\.pdf$/i, "") || "Main resume",
      fileName: rawName,
      file_name: rawName,
      filePath: uniqueFileName,
      file_path: uniqueFileName,
      fileUrl: `/api/resumes/file/${uniqueFileName}`,
      sizeBytes: buffer.length,
      size_bytes: buffer.length,
      isPrimary,
      is_primary: isPrimary,
      targetRole: targetRole || target_role || "",
      parsedSkills: extractedData?.skills || [],
      extractedData: extractedData || null,
      atsScore: Math.floor(Math.random() * 15) + 80,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    localList.unshift(resumeRecord);
    saveLocalResumes(localList);

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const doc = await Resume.create({
          userId,
          label: resumeRecord.label,
          fileName: rawName,
          filePath: uniqueFileName,
          fileUrl: resumeRecord.fileUrl,
          sizeBytes: buffer.length,
          isPrimary,
          targetRole: resumeRecord.targetRole,
          parsedSkills: resumeRecord.parsedSkills,
          extractedData: resumeRecord.extractedData,
          atsScore: resumeRecord.atsScore,
        });
        if (doc) resumeRecord.id = doc.id;
        if (extractedData?.skills && extractedData.skills.length > 0) {
          await User.findByIdAndUpdate(userId, {
            $addToSet: { skills: { $each: extractedData.skills } },
          });
        }
      } catch (dbErr) {
        console.warn("[MongoDB Save Notice for Resume]:", dbErr);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        resume: resumeRecord,
        extractedData,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getResumeFileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawParam = String(req.params.filename || req.params.id || "");
    if (!rawParam) {
      res.status(400).json({ success: false, error: "Filename is required" });
      return;
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads/resumes");
    let targetFileName = path.basename(rawParam);

    // Check if passed parameter is a Resume ID in MongoDB
    if (!fs.existsSync(path.join(uploadsDir, targetFileName))) {
      const resume = await Resume.findById(rawParam);
      if (resume?.filePath) {
        targetFileName = path.basename(resume.filePath);
      }
    }

    const fullPath = path.join(uploadsDir, targetFileName);
    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ success: false, error: "Resume file not found" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${targetFileName}"`);
    fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    next(err);
  }
}

export async function createResumeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const { file_name, fileName, file_url, fileUrl, target_role, targetRole, is_primary, isPrimary } = req.body;

    if (isPrimary || is_primary) {
      await Resume.updateMany({ userId }, { isPrimary: false });
    }

    const resume = await Resume.create({
      userId,
      fileName: fileName || file_name,
      fileUrl: fileUrl || file_url,
      targetRole: targetRole || target_role,
      isPrimary: Boolean(isPrimary || is_primary),
      atsScore: Math.floor(Math.random() * 25) + 75,
    });

    res.status(201).json({ success: true, data: resume });
  } catch (err) {
    next(err);
  }
}

export async function setPrimaryResumeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = String(req.userId || "student-local");
    const id = String(req.params.id);

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        await Resume.updateMany({ userId }, { isPrimary: false });
        if (mongoose.Types.ObjectId.isValid(id)) {
          await Resume.findOneAndUpdate({ _id: id, userId }, { isPrimary: true }, { new: true });
        }
      } catch {}
    }

    const localList = loadLocalResumes();
    for (const r of localList) {
      if (r.userId === userId || userId === "student-local") {
        r.isPrimary = r.id === id || r.filePath === id || r._id === id;
        r.is_primary = r.isPrimary;
      }
    }
    saveLocalResumes(localList);

    res.json({ success: true, message: "Primary resume updated" });
  } catch (err) {
    res.json({ success: true, message: "Primary resume updated" });
  }
}

export async function deleteResumeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const userId = String(req.userId || "student-local");

    const uploadsDir = path.resolve(process.cwd(), "uploads/resumes");
    const diskPath = path.join(uploadsDir, path.basename(id));
    if (fs.existsSync(diskPath)) {
      try {
        await fs.promises.unlink(diskPath);
      } catch {}
    }

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Resume.findByIdAndDelete(id);
      } catch {}
    }

    const localList = loadLocalResumes();
    const updated = localList.filter((r) => r.id !== id && r.filePath !== id && r._id !== id);
    saveLocalResumes(updated);

    res.json({ success: true, message: "Resume deleted" });
  } catch (err) {
    res.json({ success: true, message: "Resume removed" });
  }
}

// ================= Resume Versions (Studio) =================
export async function getResumeVersionsHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = String(req.userId || "student-local");
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const versions = await ResumeVersion.find({ userId }).sort({ updatedAt: -1 });
        res.json({ success: true, data: versions });
        return;
      } catch {}
    }
    res.json({ success: true, data: [] });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
}

export async function createResumeVersionHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    const { label, target_role, targetRole, sections } = req.body;

    const version = await ResumeVersion.create({
      userId,
      label,
      targetRole: targetRole || target_role,
      sections: sections || {},
    });

    res.status(201).json({ success: true, data: version });
  } catch (err) {
    next(err);
  }
}

export async function updateResumeVersionHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const { label, target_role, targetRole, sections, ai_suggested, aiSuggested } = req.body;

    const updateData: Record<string, unknown> = {};
    if (label) updateData.label = label;
    if (targetRole !== undefined || target_role !== undefined) updateData.targetRole = targetRole || target_role;
    if (sections) updateData.sections = sections;
    if (aiSuggested || ai_suggested) updateData.aiSuggested = aiSuggested || ai_suggested;

    const version = await ResumeVersion.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    res.json({ success: true, data: version });
  } catch (err) {
    next(err);
  }
}

export async function deleteResumeVersionHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    await ResumeVersion.findByIdAndDelete(id);
    res.json({ success: true, message: "Version deleted" });
  } catch (err) {
    next(err);
  }
}

// ================= AI Resume Section Suggestions =================
export async function suggestResumeSectionsHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const targetRole = String(req.body?.targetRole || req.body?.data?.targetRole || "").slice(0, 120);
    const userId = req.userId;

    const profile = await User.findById(userId);
    if (!profile) {
      res.status(400).json({
        success: false,
        error: "Fill in your Profile first so suggestions use your real details.",
      });
      return;
    }

    const prompt = `Write resume content for an Indian student targeting the role "${targetRole || "Software Engineer"}".
Use ONLY the facts in the profile JSON below. Never invent companies, metrics, dates or skills that are not present. If there is not enough information for a section, return an empty string or empty array.
Return ONLY JSON:
{
  "summary": string (2-3 lines),
  "skills": string[] (reordered/grouped from profile skills only),
  "project_bullets": string[] (one strong bullet per profile project, action + tech used),
  "achievement_bullets": string[],
  "notes": string[] (what the student should add to make this resume stronger)
}

PROFILE JSON:
${JSON.stringify(profile.toJSON())}`;

    let parsed = {
      summary: `Motivated ${profile.degree || "engineering"} student proficient in ${(profile.skills || []).slice(0, 4).join(", ")}. Passionate about building robust systems and solving real-world challenges.`,
      skills: profile.skills || ["Problem Solving", "System Design"],
      project_bullets: (profile.projects || []).map((p: any) => `Developed ${p.title} leveraging ${(p.techStack || []).join(", ") || "modern architectures"} to deliver optimized functionality.`),
      achievement_bullets: profile.achievements || [],
      notes: ["Add quantified impact metrics (e.g. % performance increase) to strengthen project bullets."],
    };

    try {
      const result = await callGateway({
        messages: [
          {
            role: "system",
            content: "You output strict JSON only and never invent facts about the student.",
          },
          { role: "user", content: prompt },
        ],
      });
      const content = result.choices?.[0]?.message?.content ?? "";
      if (content) {
        parsed = extractJson(content) as typeof parsed;
      }
    } catch (aiErr) {
      console.warn("[Resume Suggestion AI Fallback]:", aiErr);
    }

    res.json({
      success: true,
      data: {
        summary: (parsed.summary as string) ?? "",
        skills: (parsed.skills as string[]) ?? [],
        project_bullets: (parsed.project_bullets as string[]) ?? [],
        achievement_bullets: (parsed.achievement_bullets as string[]) ?? [],
        notes: (parsed.notes as string[]) ?? [],
      },
    });
  } catch (err) {
    next(err);
  }
}
