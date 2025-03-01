const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { processFileConversion } = require("../controllers/pdfController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Convert Single/Multiple Files to PDF
router.post("/convert", upload.array("files", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded!" });
    }

    const result = await processFileConversion(req.files);
    const absoluteFilePath = path.resolve(result.filePath);

    // ✅ Ensure file exists before sending
    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(500).json({ error: "File not found after conversion." });
    }

    res.download(absoluteFilePath, result.type === "single" ? "converted.pdf" : "converted_files.zip", (err) => {
      if (err) console.error("❌ File Download Error:", err);

      // ✅ Cleanup temporary files after sending
      result.tempFiles.forEach((file) => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });

      console.log("🗑️ Temporary files deleted.");
    });

  } catch (error) {
    console.error("❌ Conversion Error:", error);
    res.status(500).json({ error: "File conversion failed." });
  }
});

module.exports = router;
