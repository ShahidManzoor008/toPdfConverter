require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const archiver = require("archiver");

const app = express();
const port = process.env.PORT || 5000;

// -------------------------
// Middleware Configuration
// -------------------------
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["*"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

// -------------------------
// Multer File Upload Setup
// -------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// -------------------------
// PDF Conversion Functions
// -------------------------
const libreOfficePath = process.env.LIBREOFFICE_PATH || "/usr/bin/soffice";

// Convert a single file to PDF using LibreOffice
const convertToPDF = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(inputPath);
    const command = `${libreOfficePath} --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ LibreOffice Conversion Error:", stderr);
        return reject("LibreOffice failed to convert the file.");
      }

      console.log("📄 LibreOffice Output:", stdout);

      // Find the generated PDF file in the output directory
      const files = fs.readdirSync(outputDir);
      const pdfFile = files.find(
        (file) =>
          file.endsWith(".pdf") &&
          file.includes(path.basename(inputPath, path.extname(inputPath)))
      );

      if (!pdfFile) {
        console.error("❌ PDF file was not created.");
        return reject("Conversion failed: No output file.");
      }

      const generatedPdfPath = path.join(outputDir, pdfFile);
      console.log(`✅ PDF Successfully Created: ${generatedPdfPath}`);

      if (!fs.existsSync(generatedPdfPath)) {
        return reject("File conversion failed: PDF file not found.");
      }

      resolve(generatedPdfPath);
    });
  });
};

// Process conversion for one or more files
const processFileConversion = async (files) => {
  const convertedFiles = [];

  for (const file of files) {
    try {
      const pdfPath = await convertToPDF(file.path);
      convertedFiles.push({
        original: file.originalname,
        converted: pdfPath,
        temp: file.path,
      });
    } catch (error) {
      console.error(`❌ Error converting ${file.originalname}:`, error);
    }
  }

  // If a single file is uploaded, return it directly
  if (convertedFiles.length === 1) {
    return {
      type: "single",
      filePath: path.resolve(convertedFiles[0].converted),
      tempFiles: [convertedFiles[0].temp, convertedFiles[0].converted],
    };
  }

  // If multiple files, create a ZIP archive
  const zipPath = path.resolve(`uploads/converted_${Date.now()}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip");

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      console.log("✅ ZIP Created:", zipPath);
      resolve({
        type: "zip",
        filePath: zipPath,
        tempFiles: [
          ...convertedFiles.map((f) => f.temp),
          ...convertedFiles.map((f) => f.converted),
          zipPath,
        ],
      });
    });

    archive.on("error", (err) => {
      console.error("❌ ZIP Error:", err);
      reject(err);
    });

    archive.pipe(output);
    convertedFiles.forEach(({ original, converted }) => {
      const zipFileName = original.replace(/\.[^/.]+$/, "_converted.pdf");
      archive.file(converted, { name: zipFileName });
    });

    archive.finalize();
  });
};

// Cleanup temporary files after download
const cleanupFiles = (files) => {
  files.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️ Deleted temp file: ${file}`);
    }
  });
};

// -------------------------
// API Endpoint
// -------------------------
app.post("/api/files/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const result = await processFileConversion(req.files);
    res.download(result.filePath, (err) => {
      if (err) {
        console.error("Download error:", err);
      }
      cleanupFiles(result.tempFiles);
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// -------------------------
// Start the Server
// -------------------------
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});



// // ============================
// // 📂 Server: index.js (Express API for File Conversion)
// // ============================

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const dotenv = require("dotenv");
// const fileRoutes = require("./routes/fileRoutes");

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

// // ✅ Load CORS Origins from .env
// const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"];

// // ✅ Configure CORS
// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );

// // ✅ Security Middleware
// app.use(helmet());
// app.use(express.json());

// // ✅ API Routes
// app.use("/api/files", fileRoutes);

// // ✅ Start Server
// app.listen(port, () => {
//   console.log(`🚀 Server running on port ${port}`);
// });
