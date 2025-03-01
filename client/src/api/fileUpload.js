import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/files";

// ✅ Function to upload files & get the converted result
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const response = await axios.post(`${API_BASE_URL}/convert`, formData, {
      responseType: "blob", // ✅ Important for file downloads
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { data: response.data, type: files.length === 1 ? "pdf" : "zip" };
  } catch (error) {
    console.error("❌ Upload Error:", error);
    throw new Error("File conversion failed.");
  }
};
