import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // ✅ Use import.meta.env

export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const response = await axios.post(`${API_BASE_URL}/convert`, formData, {
      responseType: "blob",
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { data: response.data, type: files.length === 1 ? "pdf" : "zip" };
  } catch (error) {
    console.error("❌ Upload Error:", error);
    throw new Error("File conversion failed.");
  }
};
