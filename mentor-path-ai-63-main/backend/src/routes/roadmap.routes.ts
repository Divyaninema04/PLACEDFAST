import { Router } from "express";
import {
  getRoadmapProgressHandler,
  upsertRoadmapProgressHandler,
} from "../controllers/roadmap.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getRoadmapProgressHandler);
router.post("/", requireAuth, upsertRoadmapProgressHandler);

export default router;
