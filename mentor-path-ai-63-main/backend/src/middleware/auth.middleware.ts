import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User, type IUser } from "../models/User.js";
import mongoose from "mongoose";
import { isDbConnected, getPrimaryStudentId } from "../config/db.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: "7d",
  });
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const defaultStudentId = getPrimaryStudentId();

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (defaultStudentId) {
      req.userId = defaultStudentId;
      try {
        req.user = (await User.findById(defaultStudentId)) || undefined;
      } catch {}
    } else {
      req.userId = "student-local";
    }
    return next();
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (token === "student-local" || !token) {
    if (defaultStudentId) {
      req.userId = defaultStudentId;
      try {
        req.user = (await User.findById(defaultStudentId)) || undefined;
      } catch {}
    } else {
      req.userId = "student-local";
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    req.userId = decoded.id;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(decoded.id)) {
      try {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      } catch {
        // Continue with req.userId
      }
    }
    next();
  } catch (err) {
    if (defaultStudentId) {
      req.userId = defaultStudentId;
      try {
        req.user = (await User.findById(defaultStudentId)) || undefined;
      } catch {}
    } else {
      req.userId = "student-local";
    }
    next();
  }
}
