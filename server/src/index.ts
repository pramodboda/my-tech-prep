import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import technologyRoutes from "./routes/technologies";
import topicRoutes from "./routes/topics";
import questionRoutes from "./routes/questions";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/technologies", technologyRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/questions", questionRoutes);

app.listen(PORT, () => {
  console.log(`TechPrep API running on http://localhost:${PORT}`);
});
