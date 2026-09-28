import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { config } from "./env.js";
import { User, type IUser } from "../models/User.js";

let isConnected = false;
let primaryStudentId: string | null = null;

export function isDbConnected(): boolean {
  return isConnected;
}

export function getPrimaryStudentId(): string | null {
  return primaryStudentId;
}

export async function ensureDefaultStudentUser(): Promise<IUser | null> {
  if (!isConnected) return null;
  try {
    let student = await User.findOne({ email: "student@placementpilot.edu" });
    if (!student) {
      student = await User.create({
        email: "student@placementpilot.edu",
        fullName: "Student",
        degree: "",
        branch: "",
        skills: [],
      });
      console.log(`[Database] Created default student account: ${student.id}`);
    }
    primaryStudentId = student.id;
    return student;
  } catch (err) {
    console.warn("[Database] Could not ensure student user:", err);
    return null;
  }
}

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  // 1. Try connecting to configured MongoDB (e.g. mongodb://localhost:27017/placementpilot)
  try {
    mongoose.set("bufferCommands", false);
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to external instance: ${conn.connection.host}/${conn.connection.name}`);
    await ensureDefaultStudentUser();
    return;
  } catch (err) {
    console.warn(`[MongoDB Notice] External MongoDB not active at ${config.mongodbUri}.`);
  }

  // 2. Automatically launch embedded persistent MongoMemoryServer
  try {
    const dbDir = path.resolve(process.cwd(), "data/db");
    fs.mkdirSync(dbDir, { recursive: true });

    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const server = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir,
        storageEngine: "wiredTiger",
      },
    });

    const memoryUri = server.getUri();
    await mongoose.connect(memoryUri);
    isConnected = true;
    console.log(`[MongoDB] Connected to embedded persistent instance at: ${memoryUri}`);
    await ensureDefaultStudentUser();
  } catch (memoryErr: any) {
    console.error("[MongoDB Error] Failed to start embedded database:", memoryErr?.message || memoryErr);
    isConnected = false;
  }

  mongoose.connection.on("error", (err) => {
    console.error(`[MongoDB Connection Error]:`, err);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[MongoDB] Disconnected from database.");
  });
}
