import React, { useState } from "react";
import { uploadFiles } from "../api/fileUpload";

const PDFConverter = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [convertedFile, setConvertedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Handle file selection
  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
    setConvertedFile(null); // Reset previous result
  };

  // ✅ Handle file upload & conversion
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, type } = await uploadFiles(selectedFiles);
      const fileURL = window.URL.createObjectURL(new Blob([data]));
      const fileName =
        selectedFiles.length === 1
          ? selectedFiles[0].name.replace(/\.[^/.]+$/, "_converted." + type)
          : "converted_files.zip";

      setConvertedFile({ url: fileURL, name: fileName });
    } catch (error) {
      alert("Conversion failed. Please try again.");
    }
    setIsLoading(false);
  };

  // ✅ Clear file selections
  const handleClear = () => {
    setSelectedFiles([]);
    setConvertedFile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4">PDF Converter</h1>

        {/* ✅ File Upload Input */}
        <input type="file" multiple onChange={handleFileChange} className="border p-2 w-full mb-4" />

        {/* ✅ Convert & Clear Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? "Converting..." : "Convert to PDF"}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Clear
          </button>
        </div>

        {/* ✅ Show selected file count */}
        {selectedFiles.length > 0 && (
          <p className="mt-4 text-gray-700">{selectedFiles.length} file(s) selected</p>
        )}

        {/* ✅ Show download button after conversion */}
        {convertedFile && (
          <div className="mt-4">
            <p className="text-green-600 font-semibold">Conversion Successful!</p>
            <a
              href={convertedFile.url}
              download={convertedFile.name}
              className="bg-green-600 text-white px-4 py-2 rounded-lg mt-2 inline-block hover:bg-green-700 transition"
            >
              Download {convertedFile.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFConverter;
