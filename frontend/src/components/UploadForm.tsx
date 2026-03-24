import { useState, useEffect } from "react";
import AIResult from "./AIResult";
import HeatmapCanvas from "./HeatmapCanvas";

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
    setLoading(true);

    // 🔥 fake AI response (có bounding box)
    setTimeout(() => {
      setResult({
        severity: "high",
        type: "Air Pollution",
        boxes: [
          { x: 120, y: 80, width: 100, height: 100 },
          { x: 200, y: 120, width: 80, height: 80 },
        ],
      });
      setLoading(false);
    }, 1500);
  };

  // 🔥 scroll tới result (UX xịn)
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
      {/* Drag & Drop */}
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
          <AIResult severity={result.severity} type={result.type} />
        </div>
      )}
    </div>
  );
}