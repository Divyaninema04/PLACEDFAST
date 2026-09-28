import { Router } from "express";
import { chatMentorHandler } from "../controllers/mentor.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// POST /api/mentor/chat - chat with AI placement mentor
router.post("/chat", requireAuth, chatMentorHandler);

export default router;
