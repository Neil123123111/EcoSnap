import { motion } from "framer-motion";
import type { TopPredictionPayload } from "../services/api";

type Props = {
  severity: "low" | "medium" | "high";
  type: string;
  confidence?: number;
  image_url?: string;
  top_predictions?: TopPredictionPayload[];
  model_path?: string;
};

export default function AIResult({
  severity,
  type,
  confidence,
  image_url,
  top_predictions = [],
  model_path,
}: Props) {
  const classThemeMap: Record<
    string,
    {
      pill: string;
      panel: string;
      strong: string;
      progress: string;
    }
  > = {
    paper: {
      pill: "bg-violet-500",
      panel: "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:border-violet-900/50 dark:from-violet-950/30 dark:via-slate-900 dark:to-fuchsia-950/20",
      strong: "text-violet-700 dark:text-violet-300",
      progress: "from-violet-500 via-fuchsia-400 to-pink-500",
    },
    plastic: {
      pill: "bg-rose-500",
      panel: "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:border-rose-900/50 dark:from-rose-950/30 dark:via-slate-900 dark:to-orange-950/20",
      strong: "text-rose-700 dark:text-rose-300",
      progress: "from-rose-500 via-orange-400 to-amber-500",
    },
    glass: {
      pill: "bg-cyan-500",
      panel: "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-sky-50 dark:border-cyan-900/50 dark:from-cyan-950/30 dark:via-slate-900 dark:to-sky-950/20",
      strong: "text-cyan-700 dark:text-cyan-300",
      progress: "from-cyan-500 via-sky-400 to-blue-500",
    },
    metal: {
      pill: "bg-slate-500",
      panel: "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-zinc-50 dark:border-slate-800/70 dark:from-slate-900 dark:via-slate-900 dark:to-zinc-950/30",
      strong: "text-slate-700 dark:text-slate-300",
      progress: "from-slate-500 via-zinc-400 to-gray-500",
    },
    cardboard: {
      pill: "bg-amber-600",
      panel: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:border-amber-900/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-yellow-950/20",
      strong: "text-amber-700 dark:text-amber-300",
      progress: "from-amber-600 via-yellow-500 to-orange-500",
    },
    trash: {
      pill: "bg-emerald-600",
      panel: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20",
      strong: "text-emerald-700 dark:text-emerald-300",
      progress: "from-emerald-500 via-teal-400 to-sky-500",
    },
  };

  const normalizedType = type.toLowerCase();
  const activeTheme = classThemeMap[normalizedType] || classThemeMap.trash;
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

      {/* confidence */}
      {confidence !== undefined && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Confidence: {(confidence * 100).toFixed(2)}%
        </p>
      )}

      {top_predictions.length > 0 && (
        <div className={`mt-4 rounded-2xl border p-4 ${activeTheme.panel}`}>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Top predictions</p>
          <div className="mt-3 grid gap-3">
            {top_predictions.slice(0, 3).map((prediction, index) => (
              <div
                key={`${prediction.label}-${prediction.confidence}`}
                className={`rounded-xl px-3 py-3 ${
                  index === 0
                    ? "border border-white/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-800"
                    : "bg-white/70 dark:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white ${index === 0 ? activeTheme.pill : "bg-gray-900 dark:bg-white dark:text-gray-900"}`}>
                      {index + 1}
                    </span>
                    <span className={`font-semibold capitalize text-gray-800 dark:text-gray-100 ${index === 0 ? activeTheme.strong : ""}`}>
                      {prediction.label}
                    </span>
                  </div>
                  <span className="font-medium text-gray-600 dark:text-gray-200">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80 dark:bg-slate-950/70">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${activeTheme.progress}`}
                    style={{ width: `${Math.max(prediction.confidence * 100, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {model_path && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 break-all">
          Model: {model_path}
        </p>
      )}
    </motion.div>
  );
}
