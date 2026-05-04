import { Router } from "express";
import {
  createPrompt,
  getMyPrompts,
  getMyStats,
  getPrompt,
  updatePrompt,
  deletePrompt,
  createPromptSchema,
  updatePromptSchema,
  getExplore,
  getTrending,
  toggleVote,
  incrementCopy,
  forkPrompt,
} from "../controllers/prompts.controller.js";
import { requireAuth, optionalAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";

export const promptsRoutes = Router();

promptsRoutes.get("/explore", optionalAuth, getExplore);
promptsRoutes.get("/trending", optionalAuth, getTrending);
promptsRoutes.get("/me/stats", requireAuth, getMyStats);
promptsRoutes.get("/me", requireAuth, getMyPrompts);
promptsRoutes.post(
  "/",
  requireAuth,
  validate(createPromptSchema),
  createPrompt,
);
promptsRoutes.get("/:id", optionalAuth, getPrompt);
promptsRoutes.patch(
  "/:id",
  requireAuth,
  validate(updatePromptSchema),
  updatePrompt,
);
promptsRoutes.delete("/:id", requireAuth, deletePrompt);
promptsRoutes.post("/:id/vote", requireAuth, toggleVote);
promptsRoutes.post("/:id/copy", incrementCopy);
promptsRoutes.post("/:id/fork", requireAuth, forkPrompt);
