import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { influencerRoutes } from "./routes/influencer.routes.js";
import { analyticsRoutes } from "./routes/analytics.routes.js";
import { growthRoutes } from "./routes/growth.routes.js";
import { salesRoutes } from "./routes/sales.routes.js";
import { webhookRoutes } from "./routes/webhooks.routes.js";

export const app = express();

// Allow localhost on common dev ports (Next.js may use 3001/3002 if 3000 is taken)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/influencers", influencerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/growth", growthRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/webhooks", webhookRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
