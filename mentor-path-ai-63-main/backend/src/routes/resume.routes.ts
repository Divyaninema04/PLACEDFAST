import { Router } from "express";
import multer from "multer";
import {
  getResumesHandler,
  uploadAndExtractResumeHandler,
  getResumeFileHandler,
  createResumeHandler,
  setPrimaryResumeHandler,
  deleteResumeHandler,
  getResumeVersionsHandler,
  createResumeVersionHandler,
  updateResumeVersionHandler,
  deleteResumeVersionHandler,
  suggestResumeSectionsHandler,
} from "../controllers/resume.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Multer in-memory upload handler
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Public/direct download endpoint for files
router.get("/file/:filename", getResumeFileHandler);

router.use(requireAuth);

// Uploaded Resumes
router.get("/", getResumesHandler);
router.post("/upload", upload.single("resume"), uploadAndExtractResumeHandler);
router.post("/", createResumeHandler);
router.patch("/:id/primary", setPrimaryResumeHandler);
router.delete("/:id", deleteResumeHandler);

// Resume Studio Versions
router.get("/versions", getResumeVersionsHandler);
router.post("/versions", createResumeVersionHandler);
router.put("/versions/:id", updateResumeVersionHandler);
router.delete("/versions/:id", deleteResumeVersionHandler);

// AI Suggestions
router.post("/suggest", suggestResumeSectionsHandler);

export default router;
