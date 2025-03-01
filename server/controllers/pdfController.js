const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

// ✅ Convert a single file to PDF using LibreOffice
const convertToPDF = (inputPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(inputPath);
    const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ LibreOffice Conversion Error:", stderr);
        return reject("LibreOffice failed to convert the file.");
      }

      console.log("📄 LibreOffice Output:", stdout);

      // ✅ Dynamically find the generated PDF file
      const files = fs.readdirSync(outputDir);
      const pdfFile = files.find(file => file.endsWith(".pdf") && file.includes(path.basename(inputPath)));

      if (!pdfFile) {
        console.error("❌ PDF file was not created.");
        return reject("Conversion failed: No output file.");
      }

      const generatedPdfPath = path.join(outputDir, pdfFile);
      console.log(`✅ PDF Successfully Created: ${generatedPdfPath}`);

      // ✅ Ensure file exists before returning
      if (!fs.existsSync(generatedPdfPath)) {
        return reject("File conversion failed: PDF file not found.");
      }

      resolve(generatedPdfPath);
    });
  });
};

// ✅ Convert multiple files and return a ZIP if more than one file is uploaded
const processFileConversion = async (files) => {
  const convertedFiles = [];

  for (const file of files) {
    const pdfPath = await convertToPDF(file.path);
    convertedFiles.push({ original: file.originalname, converted: pdfPath, temp: file.path });
  }

  // ✅ If single file, return it directly
  if (convertedFiles.length === 1) {
    return { type: "single", filePath: path.resolve(convertedFiles[0].converted), tempFiles: [convertedFiles[0].temp, convertedFiles[0].converted] };
  }

  // ✅ If multiple files, create ZIP
  const zipPath = path.resolve(`uploads/converted_${Date.now()}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip");

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      console.log("✅ ZIP Created:", zipPath);
      resolve({ type: "zip", filePath: zipPath, tempFiles: [...convertedFiles.map(f => f.temp), ...convertedFiles.map(f => f.converted), zipPath] });
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

// ✅ Export only the PDF conversion functions
module.exports = {
  convertToPDF,
  processFileConversion,
};
