import express from "express";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes.js";
import { influencerRoutes } from "./routes/influencer.routes.js";
import { analyticsRoutes } from "./routes/analytics.routes.js";
import { growthRoutes } from "./routes/growth.routes.js";
import { salesRoutes } from "./routes/sales.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/influencers", influencerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/growth", growthRoutes);
app.use("/api/sales", salesRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
