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

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// API Routes
app.use("/api/files", fileRoutes);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
