import express from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getUserProfile,
  saveUserPreferences,
  completeUserOnboarding,
} from "../controllers/onboarding.controller.js";

const router = express.Router();

router.get("/profile", protectRoute, getUserProfile);
router.post("/preferences", protectRoute, saveUserPreferences);
router.post("/complete", protectRoute, completeUserOnboarding);

export default router;
