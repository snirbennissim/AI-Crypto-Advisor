import expresss from "express";

import { protectRoute } from "../middlewares/auth.middleware.js";
import { createOrUpdateVote } from "../controllers/vote.controller.js";

const router = expresss.Router();

router.post("/", protectRoute, createOrUpdateVote);

export default router;
