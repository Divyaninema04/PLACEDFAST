import type { Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";
import { isDbConnected, getPrimaryStudentId } from "../config/db.js";

const BACKUP_PROFILE_PATH = path.resolve(process.cwd(), "data/profile-backup.json");

function loadBackupProfile(): Record<string, any> | null {
  try {
    if (fs.existsSync(BACKUP_PROFILE_PATH)) {
      const raw = fs.readFileSync(BACKUP_PROFILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function saveBackupProfile(data: Record<string, any>): void {
  try {
    const dir = path.dirname(BACKUP_PROFILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BACKUP_PROFILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[User Profile] Failed to write backup file:", err);
  }
}

export async function getProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId || getPrimaryStudentId();
    let user = null;

    if (isDbConnected()) {
      try {
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          user = await User.findById(userId);
        }
        if (!user) {
          user = await User.findOne({ email: "student@placementpilot.edu" });
        }
      } catch (err) {
        console.warn("[User Controller] DB lookup error:", err);
      }
    }

    // If user document exists, restore any backup attributes if empty
    const backup = loadBackupProfile();
    if (user) {
      if (backup && (!user.fullName || user.fullName === "Student") && backup.fullName && backup.fullName !== "Student") {
        try {
          Object.assign(user, backup);
          await user.save();
        } catch {}
      }
      res.json({ success: true, data: user.toJSON() });
      return;
    }

    // Fallback to backup or clean profile
    if (backup) {
      res.json({ success: true, data: backup });
      return;
    }

    res.json({
      success: true,
      data: {
        id: userId || "student-local",
        fullName: "",
        full_name: "",
        name: "",
        email: "student@placementpilot.edu",
        role: "student",
        skills: [],
        degree: "",
        branch: "",
        currentSemester: null,
        current_semester: null,
        yearOfStudy: null,
        year_of_study: null,
        graduationYear: null,
        graduation_year: null,
        cgpa: null,
        targetCgpa: null,
        target_cgpa: null,
        preferredRoles: [],
        preferred_roles: [],
        dreamCompanies: [],
        dream_companies: [],
        careerInterests: [],
        career_interests: [],
        projects: [],
        certifications: [],
        codingProfiles: {},
        coding_profiles: {},
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId || getPrimaryStudentId();
    const body = req.body || {};
    const updateData: Record<string, any> = {};

    if (body.fullName !== undefined || body.full_name !== undefined || body.name !== undefined) {
      updateData.fullName = body.fullName || body.full_name || body.name || "";
      updateData.full_name = updateData.fullName;
      updateData.name = updateData.fullName;
    }
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.college !== undefined) updateData.college = body.college;
    if (body.university !== undefined) updateData.university = body.university;
    if (body.branch !== undefined) updateData.branch = body.branch;
    if (body.degree !== undefined) updateData.degree = body.degree;
    if (body.course !== undefined) updateData.course = body.course;

    if (body.yearOfStudy !== undefined || body.year_of_study !== undefined) {
      const v = body.yearOfStudy ?? body.year_of_study;
      updateData.yearOfStudy = v != null && v !== "" ? Number(v) : null;
      updateData.year_of_study = updateData.yearOfStudy;
    }
    if (body.currentSemester !== undefined || body.current_semester !== undefined) {
      const v = body.currentSemester ?? body.current_semester;
      updateData.currentSemester = v != null && v !== "" ? Number(v) : null;
      updateData.current_semester = updateData.currentSemester;
    }
    if (body.graduationYear !== undefined || body.graduation_year !== undefined) {
      const v = body.graduationYear ?? body.graduation_year;
      updateData.graduationYear = v != null && v !== "" ? Number(v) : null;
      updateData.graduation_year = updateData.graduationYear;
    }
    if (body.cgpa !== undefined) {
      updateData.cgpa = body.cgpa != null && body.cgpa !== "" ? Number(body.cgpa) : null;
    }
    if (body.targetCgpa !== undefined || body.target_cgpa !== undefined) {
      const v = body.targetCgpa ?? body.target_cgpa;
      updateData.targetCgpa = v != null && v !== "" ? Number(v) : null;
      updateData.target_cgpa = updateData.targetCgpa;
    }
    if (body.skills !== undefined) {
      updateData.skills = Array.isArray(body.skills) ? body.skills : [];
    }
    if (body.achievements !== undefined) {
      updateData.achievements = Array.isArray(body.achievements)
        ? body.achievements
        : (body.achievements ? [body.achievements] : []);
    }
    if (body.projects !== undefined) updateData.projects = body.projects;
    if (body.certifications !== undefined) updateData.certifications = body.certifications;
    if (body.codingProfiles !== undefined || body.coding_profiles !== undefined) {
      updateData.codingProfiles = body.codingProfiles ?? body.coding_profiles ?? {};
      updateData.coding_profiles = updateData.codingProfiles;
    }
    if (body.dreamCompanies !== undefined || body.dream_companies !== undefined) {
      updateData.dreamCompanies = body.dreamCompanies ?? body.dream_companies ?? [];
      updateData.dream_companies = updateData.dreamCompanies;
    }
    if (body.preferredRoles !== undefined || body.preferred_roles !== undefined) {
      updateData.preferredRoles = body.preferredRoles ?? body.preferred_roles ?? [];
      updateData.preferred_roles = updateData.preferredRoles;
    }
    if (body.careerInterests !== undefined || body.career_interests !== undefined) {
      updateData.careerInterests = body.careerInterests ?? body.career_interests ?? [];
      updateData.career_interests = updateData.careerInterests;
    }
    if (body.state !== undefined) updateData.state = body.state;

    // Save backup to disk
    const existingBackup = loadBackupProfile() || {};
    const mergedBackup = { ...existingBackup, ...updateData, id: userId || "student-local" };
    saveBackupProfile(mergedBackup);

    // Save to MongoDB
    if (isDbConnected()) {
      try {
        let user = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
          user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
        }
        if (!user) {
          user = await User.findOneAndUpdate(
            { email: "student@placementpilot.edu" },
            { $set: updateData },
            { new: true, upsert: true, runValidators: true },
          );
        }
        if (user) {
          res.json({ success: true, data: user.toJSON() });
          return;
        }
      } catch (dbErr) {
        console.warn("[User Profile] DB update error:", dbErr);
      }
    }

    res.json({ success: true, data: mergedBackup });
  } catch (err) {
    next(err);
  }
}
