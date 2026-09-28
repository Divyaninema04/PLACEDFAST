import { Router } from "express";
import {
  getApplicationsHandler,
  createApplicationHandler,
  updateApplicationHandler,
  deleteApplicationHandler,
} from "../controllers/application.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getApplicationsHandler);
router.post("/", createApplicationHandler);
router.put("/:id", updateApplicationHandler);
router.delete("/:id", deleteApplicationHandler);

export default router;
