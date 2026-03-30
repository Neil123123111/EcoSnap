const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/report/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json();
};