import { Router } from "express";
import {
  getCompaniesHandler,
  getCompanyBySlugHandler,
  addCompanyHandler,
  updateCompanyHandler,
  deleteCompanyHandler,
} from "../controllers/company.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getCompaniesHandler);
router.get("/:slug", getCompanyBySlugHandler);
router.post("/", requireAuth, addCompanyHandler);
router.put("/:id", requireAuth, updateCompanyHandler);
router.delete("/:id", requireAuth, deleteCompanyHandler);

export default router;
