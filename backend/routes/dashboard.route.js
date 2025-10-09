import express from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import { getPersonalizedDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/personalizedDashboard", protectRoute, getPersonalizedDashboard);

export default router;
