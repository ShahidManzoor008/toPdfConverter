// ============================
// 📂 Server: index.js (Express API for File Conversion)
// ============================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const fileRoutes = require("./routes/fileRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ Load CORS Origins from .env
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"];

// ✅ Configure CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ✅ Security Middleware
app.use(helmet());
app.use(express.json());

// ✅ API Routes
app.use("/api/files", fileRoutes);

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
