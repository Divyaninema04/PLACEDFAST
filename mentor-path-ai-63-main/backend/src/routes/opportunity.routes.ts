import { Router } from "express";
import {
  getOpportunitiesHandler,
  getOpportunityByIdHandler,
  getSavedOpportunitiesHandler,
  saveOpportunityHandler,
  deleteSavedOpportunityHandler,
  fetchVerifiedOpportunitiesHandler,
} from "../controllers/opportunity.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Saved opportunities (placed before /:id)
router.get("/saved", requireAuth, getSavedOpportunitiesHandler);
router.post("/saved", requireAuth, saveOpportunityHandler);
router.delete("/saved/:id", requireAuth, deleteSavedOpportunityHandler);

// Public / Authenticated listings
router.get("/", requireAuth, getOpportunitiesHandler);
router.get("/:id", requireAuth, getOpportunityByIdHandler);

// Live ingestion
router.post("/fetch", requireAuth, fetchVerifiedOpportunitiesHandler);

export default router;
