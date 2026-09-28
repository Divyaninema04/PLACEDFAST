import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { generateToken, type AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { config } from "../config/env.js";

function getGoogleOAuthClient(req: Request): OAuth2Client {
  const host = req.get("host") || "localhost:5000";
  const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
  return new OAuth2Client(config.googleClientId, config.googleClientSecret, redirectUri);
}

export async function registerHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, error: "An account with this email already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName?.trim() || "Student",
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !user.password) {
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMeHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({
    success: true,
    data: req.user,
  });
}

/**
 * Returns the Google OAuth 2.0 authorization URL for redirect-based login.
 * GET /api/auth/google/url
 */
export async function getGoogleAuthUrlHandler(req: Request, res: Response): Promise<void> {
  try {
    if (!config.googleClientId) {
      res.status(400).json({
        success: false,
        error: "GOOGLE_CLIENT_ID is not configured in backend/.env. Please follow manual setup steps in NEXT-STEPS.md.",
      });
      return;
    }

    const oauth2Client = getGoogleOAuthClient(req);
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "profile", "email"],
      prompt: "select_account",
    });

    res.json({ success: true, url });
  } catch (err: any) {
    console.error("[Google Auth URL Error]:", err);
    res.status(500).json({ success: false, error: err?.message || "Failed to generate Google auth URL" });
  }
}

/**
 * Handles Google OAuth redirect callback.
 * GET /api/auth/google/callback
 */
export async function googleAuthCallbackHandler(req: Request, res: Response): Promise<void> {
  const frontendUrl = config.corsOrigin || "http://localhost:5173";

  try {
    const { code, error } = req.query;

    if (error) {
      console.error("[Google Callback Error]:", error);
      res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent(String(error))}`);
      return;
    }

    if (!code || typeof code !== "string") {
      res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent("Authorization code missing from Google")}`);
      return;
    }

    const oauth2Client = getGoogleOAuthClient(req);
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.id_token) {
      res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent("No ID token returned by Google")}`);
      return;
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent("Google account has no verified email")}`);
      return;
    }

    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
    });

    if (!user) {
      user = await User.create({
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        fullName: payload.name || "Student",
        avatar: payload.picture,
      });
    } else {
      let changed = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        changed = true;
      }
      if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = generateToken(user.id);
    console.log(`[Google OAuth] User authenticated successfully: ${user.email}`);

    // Redirect to frontend auth page with JWT token
    res.redirect(`${frontendUrl}/auth?token=${token}`);
  } catch (err: any) {
    console.error("[Google Callback Exception]:", err?.message || err);
    res.redirect(`${frontendUrl}/auth?error=${encodeURIComponent(err?.message || "Google authentication failed")}`);
  }
}

/**
 * Handles client-side Google ID token verification (Google Identity Services popup).
 * POST /api/auth/google
 */
export async function googleAuthHandler(req: Request, res: Response): Promise<void> {
  try {
    const { idToken, credential } = req.body || {};
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      res.status(400).json({ success: false, error: "Google credential/idToken is required" });
      return;
    }

    if (!config.googleClientId) {
      console.warn("[Google OAuth] GOOGLE_CLIENT_ID is not configured in backend/.env.");
      res.status(400).json({
        success: false,
        error: "GOOGLE_CLIENT_ID is not configured in backend/.env. Please configure it or use Demo Mode.",
      });
      return;
    }

    const oauth2Client = new OAuth2Client(config.googleClientId);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokenToVerify,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, error: "Invalid Google token payload (missing email)" });
      return;
    }

    let user = await User.findOne({
      $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
    });

    if (!user) {
      user = await User.create({
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        fullName: payload.name || "Student",
        avatar: payload.picture,
      });
    } else {
      let changed = false;
      if (!user.googleId) {
        user.googleId = payload.sub;
        changed = true;
      }
      if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = generateToken(user.id);
    console.log(`[Google OAuth API] Verified user: ${user.email}`);

    res.json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (err: any) {
    console.error("[Google Auth Error]:", err?.message || err);
    res.status(401).json({
      success: false,
      error: `Google verification failed: ${err?.message || "Invalid token"}`,
    });
  }
}
