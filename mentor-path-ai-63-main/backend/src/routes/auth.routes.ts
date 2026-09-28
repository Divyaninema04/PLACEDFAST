import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  getMeHandler,
  googleAuthHandler,
  getGoogleAuthUrlHandler,
  googleAuthCallbackHandler,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Standard Credentials Auth
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", requireAuth, getMeHandler);

// Google OAuth 2.0 (Redirect Flow & Client ID-Token Verification)
router.get("/google/url", getGoogleAuthUrlHandler);
router.get("/google/callback", googleAuthCallbackHandler);
router.post("/google", googleAuthHandler);

export default router;
