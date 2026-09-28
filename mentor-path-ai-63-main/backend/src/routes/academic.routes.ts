import { Router } from "express";
import {
  getSemestersHandler,
  upsertSemesterHandler,
  deleteSemesterHandler,
  getSubjectsHandler,
  createSubjectHandler,
  updateSubjectHandler,
  deleteSubjectHandler,
} from "../controllers/academic.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

// Semesters
router.get("/semesters", getSemestersHandler);
router.post("/semesters", upsertSemesterHandler);
router.delete("/semesters/:id", deleteSemesterHandler);

// Subjects
router.get("/subjects", getSubjectsHandler);
router.post("/subjects", createSubjectHandler);
router.put("/subjects/:id", updateSubjectHandler);
router.delete("/subjects/:id", deleteSubjectHandler);

export default router;
