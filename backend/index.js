import dns from "node:dns/promises";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/utils/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import materialRoutes from "./src/routes/materialRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";

dotenv.config();

// Use public DNS servers for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) =>
  res.json({ message: "AI StudyBuddy API is running" })
);

app.use("/api/auth", authRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });