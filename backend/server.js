import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import onboardingRoutes from "./routes/onboarding.route.js";
import voteRoutes from "./routes/vote.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";

import { connectDB } from "./lib/db.js";

const FRONTEND_URL = process.env.FRONTEND_URL;

dotenv.config();
await connectDB();

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/onboarding", onboardingRoutes);
app.use("/vote", voteRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
