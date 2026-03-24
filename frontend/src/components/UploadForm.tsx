import { useState } from "react";
import { api } from "../services/api";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/reports", formData);
    console.log(res.data);

    alert("Submitted!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-500">
      <div className="bg-white p-6 rounded-xl shadow w-[300px] text-center">
        <h1 className="text-xl font-bold mb-4">🌱 EcoSnap</h1>

        <input type="file" onChange={handleChange} />

        {preview && (
          <img src={preview} className="mt-3 rounded" />
        )}

        <button
          onClick={submit}
          className="mt-3 w-full bg-green-600 text-white py-2 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
}