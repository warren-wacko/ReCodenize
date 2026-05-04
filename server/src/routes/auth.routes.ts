import { Router } from "express";
import {
  googleAuth,
  getMe,
  logout,
  googleAuthSchema,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";

export const authRoutes = Router();

authRoutes.post("/google", validate(googleAuthSchema), googleAuth);
authRoutes.get("/me", requireAuth, getMe);
authRoutes.post("/logout", requireAuth, logout);
