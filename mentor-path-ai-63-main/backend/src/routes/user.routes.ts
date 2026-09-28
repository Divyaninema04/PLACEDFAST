import { Router } from "express";
import { getProfileHandler, updateProfileHandler } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getProfileHandler);
router.put("/", requireAuth, updateProfileHandler);
router.get("/profile", requireAuth, getProfileHandler);
router.put("/profile", requireAuth, updateProfileHandler);

export default router;
