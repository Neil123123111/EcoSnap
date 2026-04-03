import { useState, useEffect } from "react";
import AIResult from "./AIResult";
import { analyzeTrashImage, type TrashClassificationPayload } from "../services/api";
import { useToast } from "../context/ToastContext";

type UploadFormResult = TrashClassificationPayload & {
  severity: "low" | "medium" | "high";
};

export default function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadFormResult | null>(null);
  const { showToast } = useToast();

  const getSeverity = (confidence: number): "low" | "medium" | "high" => {
    if (confidence >= 0.9) return "high";
    if (confidence >= 0.7) return "medium";
    return "low";
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const arr = Array.from(selectedFiles);
    setFiles(arr);
    setPreview(arr.map((f) => URL.createObjectURL(f)));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      showToast("warning", "Thiếu ảnh", "Hãy chọn một ảnh trước khi chạy classify.");
      return;
    }

    setLoading(true);

    try {
      const data = await analyzeTrashImage(files[0]);

      setResult({
        ...data,
        severity: getSeverity(data.confidence),
      });
    } catch (err) {
      console.error(err);
      showToast(
        "danger",
        "Classify thất bại",
        err instanceof Error ? err.message : String(err)
      );
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

      {/* Preview */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {preview.map((src, i) => (
          <div key={i}>
            <img
              src={src}
              className="rounded-lg object-cover w-full h-32"
            />
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
            type={result.label}
            confidence={result.confidence}
            image_url={result.image_url}
            top_predictions={result.top_predictions}
            model_path={result.model_path}
          />
        </div>
      )}
    </div>
  );
}
