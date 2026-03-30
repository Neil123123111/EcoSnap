import { useState, useEffect } from "react";
import AIResult from "./AIResult";
import HeatmapCanvas from "./HeatmapCanvas";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const arr = Array.from(selectedFiles);
    setFiles(arr);
    setPreview(arr.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", files[0]); // lấy ảnh đầu tiên

      const res = await fetch(`${API_URL}/report/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // 🔥 convert boxes backend → format HeatmapCanvas
      const boxes =
        data.boxes?.map((b: any) => ({
          x: b.x1,
          y: b.y1,
          width: b.x2 - b.x1,
          height: b.y2 - b.y1,
        })) || [];

      setResult({
        severity: data.label === "trash" ? "high" : "medium",
        type: data.label,
        boxes,
        image_url: data.image_url,
        confidence: data.confidence,
      });
    } catch (err) {
      console.error(err);
      alert("API error");
    }

    setLoading(false);
  };

  // scroll tới result
  useEffect(() => {
    if (result) {
      document.getElementById("result")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [result]);

  return (
    <div
      className="
        bg-white dark:bg-gray-800
        text-gray-800 dark:text-gray-100
        p-6 rounded-2xl shadow w-full
        transition
      "
    >
      {/* Upload */}
      <label
        className="
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer block
          border-gray-300 dark:border-gray-600
          text-gray-500 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition
        "
      >
        Drag & drop or click to upload
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {/* Preview + Heatmap */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {preview.map((src, i) => (
          <div key={i}>
            {result ? (
              <HeatmapCanvas image={src} boxes={result.boxes} />
            ) : (
              <img
                src={src}
                className="rounded-lg object-cover w-full h-32"
              />
            )}
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={files.length === 0}
        className="
          mt-4 w-full py-2 rounded-xl
          bg-green-600 text-white
          flex items-center justify-center gap-2
          hover:bg-green-700 transition
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? (
          <>
            <span className="animate-spin">🌀</span>
            Analyzing...
          </>
        ) : (
          "Analyze"
        )}
      </button>

      {/* Result */}
      {result && (
        <div id="result" className="mt-4">
          <AIResult
            severity={result.severity}
            type={result.type}
            confidence={result.confidence}
            image_url={result.image_url}
          />
        </div>
      )}
    </div>
  );
}