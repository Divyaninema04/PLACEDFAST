import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load backend/.env first (relative to this file: backend/src/config -> backend/.env)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Also load root .env or cwd .env if present
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").trim(),
  mongodbUri: (process.env.MONGODB_URI || "mongodb://localhost:27017/placementpilot").trim(),
  jwtSecret: (process.env.JWT_SECRET || "placementpilot_super_secure_jwt_secret_2026").trim(),
  googleClientId: (process.env.GOOGLE_CLIENT_ID || "").trim(),
  googleClientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
  lovableApiKey: (process.env.LOVABLE_API_KEY || "").trim(),
  firecrawlApiKey: (process.env.FIRECRAWL_API_KEY || "").trim(),
  nodeEnv: (process.env.NODE_ENV || "development").trim(),
};

export function validateEnv() {
  if (!process.env.MONGODB_URI) {
    console.log("[Info] MONGODB_URI not specified in .env, using default local MongoDB: mongodb://localhost:27017/placementpilot");
  }
  if (!process.env.JWT_SECRET) {
    console.log("[Info] JWT_SECRET not specified in .env, using fallback development secret.");
  }
  if (!config.googleClientId) {
    console.log("[Info] GOOGLE_CLIENT_ID not set. Google OAuth will use demo authentication fallback.");
  } else {
    console.log("[Info] GOOGLE_CLIENT_ID configured successfully.");
  }
  if (config.firecrawlApiKey) {
    console.log("[Info] FIRECRAWL_API_KEY configured successfully.");
  }
}
