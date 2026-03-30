import { motion } from "framer-motion";

type Props = {
  severity: "low" | "medium" | "high";
  type: string;
  confidence?: number;
  image_url?: string;
};

export default function AIResult({
  severity,
  type,
  confidence,
  image_url,
}: Props) {
  const color =
    severity === "high"
      ? "bg-red-500"
      : severity === "medium"
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        mt-6 p-4 rounded-xl shadow-lg
        bg-white dark:bg-gray-800
        text-gray-800 dark:text-white
      "
    >
      <h3 className="font-bold mb-3">AI Result</h3>

      {/* 🔥 ảnh từ backend */}
      {image_url && (
        <img
          src={image_url}
          alt="result"
          className="w-full max-h-64 object-cover rounded-lg mb-3"
        />
      )}

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 text-white rounded-lg shadow ${color}`}
        >
          {severity.toUpperCase()}
        </span>

        <span className="text-gray-700 dark:text-gray-300">
          {type}
        </span>
      </div>

      {/* 🔥 confidence */}
      {confidence !== undefined && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Confidence: {(confidence * 100).toFixed(2)}%
        </p>
      )}
    </motion.div>
  );
}