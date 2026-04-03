import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Alert from "../components/Alert";
import Modal from "../components/Modal";
import VoiceInput from "../components/VoiceInput";
import DangerZoneDetection from "../components/DangerZoneDetection";
import HeatmapDangerMap from "../components/HeatmapDangerMap";
import CommunityDataTransparency from "../components/CommunityDataTransparency";
import { analyzeTrashImage, submitReport, fetchCommunityPosts, type TrashClassificationPayload, type CommunityPost } from "../services/api";
import { useToast } from "../context/ToastContext";

type AnalysisResult = TrashClassificationPayload & {
  severity: "low" | "medium" | "high";
  description: string;
  suggestion: string;
};

export default function UploadEvidencePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAuthModal] = useState(!isAuthenticated);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [communityReports, setCommunityReports] = useState<CommunityPost[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCommunityPosts(20).then(setCommunityReports).catch(() => {});
  }, []);

  const classThemeMap: Record<
    string,
    {
      shell: string;
      accent: string;
      badge: string;
      glow: string;
      chip: string;
      progress: string;
    }
  > = {
    paper: {
      shell:
        "border-violet-200 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.18),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(245,243,255,0.9))] dark:border-violet-900/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.22),_transparent_35%),linear-gradient(135deg,_rgba(20,10,35,0.96),_rgba(88,28,135,0.28))]",
      accent: "text-violet-700 dark:text-violet-300",
      badge: "bg-violet-500",
      glow: "shadow-[0_24px_80px_rgba(139,92,246,0.18)]",
      chip: "bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200",
      progress: "from-violet-500 via-fuchsia-400 to-pink-500",
    },
    plastic: {
      shell:
        "border-rose-200 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.18),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(255,241,242,0.9))] dark:border-rose-900/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.22),_transparent_35%),linear-gradient(135deg,_rgba(35,10,16,0.96),_rgba(127,29,29,0.28))]",
      accent: "text-rose-700 dark:text-rose-300",
      badge: "bg-rose-500",
      glow: "shadow-[0_24px_80px_rgba(244,63,94,0.16)]",
      chip: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
      progress: "from-rose-500 via-orange-400 to-amber-500",
    },
    glass: {
      shell:
        "border-cyan-200 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.18),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(236,254,255,0.9))] dark:border-cyan-900/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.22),_transparent_35%),linear-gradient(135deg,_rgba(8,24,35,0.96),_rgba(14,116,144,0.28))]",
      accent: "text-cyan-700 dark:text-cyan-300",
      badge: "bg-cyan-500",
      glow: "shadow-[0_24px_80px_rgba(6,182,212,0.16)]",
      chip: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
      progress: "from-cyan-500 via-sky-400 to-blue-500",
    },
    metal: {
      shell:
        "border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(100,116,139,0.16),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.9))] dark:border-slate-800/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(100,116,139,0.2),_transparent_35%),linear-gradient(135deg,_rgba(12,18,24,0.96),_rgba(51,65,85,0.3))]",
      accent: "text-slate-700 dark:text-slate-300",
      badge: "bg-slate-600",
      glow: "shadow-[0_24px_80px_rgba(100,116,139,0.16)]",
      chip: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
      progress: "from-slate-500 via-zinc-400 to-gray-500",
    },
    cardboard: {
      shell:
        "border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(255,251,235,0.9))] dark:border-amber-900/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_35%),linear-gradient(135deg,_rgba(36,20,8,0.96),_rgba(146,64,14,0.28))]",
      accent: "text-amber-700 dark:text-amber-300",
      badge: "bg-amber-600",
      glow: "shadow-[0_24px_80px_rgba(245,158,11,0.16)]",
      chip: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
      progress: "from-amber-600 via-yellow-500 to-orange-500",
    },
    trash: {
      shell:
        "border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(236,253,245,0.9))] dark:border-emerald-900/70 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_35%),linear-gradient(135deg,_rgba(4,18,18,0.96),_rgba(6,78,59,0.3))]",
      accent: "text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-500",
      glow: "shadow-[0_24px_80px_rgba(16,185,129,0.14)]",
      chip: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
      progress: "from-emerald-500 via-teal-400 to-sky-500",
    },
  };

  const getSeverity = (confidence: number): "low" | "medium" | "high" => {
    if (confidence >= 0.9) return "high";
    if (confidence >= 0.7) return "medium";
    return "low";
  };

  const buildDescription = (label: string, confidence: number) =>
    `AI classifier nhận diện loại rác là ${label} với độ tin cậy ${(confidence * 100).toFixed(1)}%.`;

  const buildSuggestion = (label: string) =>
    `Ưu tiên phân loại và xử lý nhóm rác "${label}" theo đúng quy trình tái chế hoặc thu gom tại địa phương.`;

  const activeTheme = analysisResult
    ? classThemeMap[analysisResult.label.toLowerCase()] || classThemeMap.trash
    : classThemeMap.trash;

  if (!isAuthenticated && showAuthModal) {
    return (
      <>
        <Navbar />
        <Modal
          isOpen={!isAuthenticated}
          title="Login Required"
          onClose={() => navigate("/")}
          size="sm"
          footer={
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Register
              </button>
            </div>
          }
        >
          <p className="text-gray-700 dark:text-gray-300">
            You must be logged in to upload environmental evidence and access the full features of EcoSnap.
          </p>
        </Modal>
      </>
    );
  }

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const arr = Array.from(selectedFiles);
    setFiles(arr);
    setPreview(arr.map((f) => URL.createObjectURL(f)));
    setAnalysisResult(null);
    setErrorMessage("");
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreview(preview.filter((_, i) => i !== index));
    if (index === 0) {
      setAnalysisResult(null);
      setErrorMessage("");
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      showToast("warning", "Thiếu ảnh", "Hãy chọn ít nhất một ảnh trước khi chạy AI analyze.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    try {
      const response = await analyzeTrashImage(files[0]);
      setAnalysisResult({
        ...response,
        severity: getSeverity(response.confidence),
        description: buildDescription(response.label, response.confidence),
        suggestion: buildSuggestion(response.label),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(message);
      showToast("danger", "Analyze thất bại", message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!files[0] || !analysisResult) {
      showToast("warning", "Chưa có kết quả", "Bạn cần analyze ảnh trước khi submit report.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport({
        imageUrl: analysisResult.image_url,
        label: analysisResult.label,
        confidence: analysisResult.confidence,
        transcript,
        latitude: location?.lat,
        longitude: location?.lng,
      });

      // Re-fetch community posts (backend auto-creates one on submit)
      fetchCommunityPosts(20).then(setCommunityReports).catch(() => {});

      setAnalysisResult(null);
      setFiles([]);
      setPreview([]);
      setTranscript("");
      setLocation(null);
      setErrorMessage("");
      showToast("success", "Đã gửi report", "Report đã được lưu vào hệ thống cùng transcript và tọa độ.");
    } catch (error) {
      showToast(
        "danger",
        "Submit thất bại",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 text-gray-900 transition-colors dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 dark:text-gray-100">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-20 pb-10 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Report Environmental Evidence
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload images, record voice descriptions, and let our AI analyze environmental violations in your area.
        </p>
      </section>

      {/* DANGER ALERT BANNER */}
      {location && (
        <div className="px-6 max-w-6xl mx-auto mb-6">
          <Alert
            variant="warning"
            title="📍 Location Detected"
            message={`You're reporting from area with coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            onClose={() => setLocation(null)}
            duration={0}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: UPLOAD FORM */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: UPLOAD IMAGE */}
            <div>
              <Card className="p-6 border border-gray-200/80 dark:border-gray-700 dark:bg-gray-800/95">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">1️⃣ Upload Evidence</h2>

                {/* FILE UPLOAD */}
                <div
                  className="rounded-lg border-2 border-dashed border-green-400 bg-white/70 p-8 text-center text-gray-800 transition hover:bg-green-50 dark:bg-gray-900/40 dark:text-gray-100 dark:hover:bg-green-900/20"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <p className="text-3xl mb-2">📸</p>
                    <p className="mb-1 font-semibold text-gray-900 dark:text-white">Drag and drop or click to upload</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Supports images and videos up to 50MB</p>
                  </label>
                </div>

                {/* PREVIEW */}
                {preview.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Preview ({preview.length})</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {preview.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative group"
                        >
                          <img src={src} alt={`Preview ${idx}`} className="w-full h-32 object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center gap-2">
                            <button
                              onClick={() => removeFile(idx)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* STEP 2: VOICE INPUT */}
            <div>
              <Card className="p-6 border border-gray-200/80 dark:border-gray-700 dark:bg-gray-800/95">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">2️⃣ Add Voice Description (Optional)</h2>
                <VoiceInput onTranscript={setTranscript} isRecording={isRecording} setIsRecording={setIsRecording} />
              </Card>
            </div>

            {/* STEP 3: AI ANALYSIS */}
            <div>
              <Card className="p-6 border border-gray-200/80 dark:border-gray-700 dark:bg-gray-800/95">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">3️⃣ AI Analysis</h2>
                <button
                  onClick={handleAnalyze}
                  disabled={files.length === 0 || isAnalyzing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition"
                >
                  {isAnalyzing ? "🔄 Analyzing..." : "🤖 Analyze Image"}
                </button>

                {errorMessage && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
                    {errorMessage}
                  </div>
                )}

                {analysisResult && (
                  <div className={`mt-6 overflow-hidden rounded-3xl border p-5 ${activeTheme.shell} ${activeTheme.glow}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${activeTheme.accent}`}>
                          Trained Classifier Result
                        </p>
                        <h3 className="mt-2 text-2xl font-black capitalize text-gray-900 dark:text-white">
                          {analysisResult.label}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            analysisResult.severity === "high"
                              ? "danger"
                              : analysisResult.severity === "medium"
                              ? "warning"
                              : "success"
                          }
                        >
                          {analysisResult.severity.toUpperCase()}
                        </Badge>
                        <span className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${activeTheme.chip}`}>
                          {(analysisResult.confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-3xl border border-white/70 bg-slate-950/90 shadow-2xl">
                          <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
                            Classification Preview
                          </div>
                          <img
                            src={analysisResult.image_url}
                            alt={analysisResult.label}
                            className="block w-full h-auto"
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-black/10">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Predictions</p>
                            <p className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                              {analysisResult.top_predictions.length}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-black/10">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Classifier</p>
                            <p className="mt-2 truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {analysisResult.label}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-black/10">
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Top-1 Confidence</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                              {(analysisResult.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-black/10">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Summary</p>
                        <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                          {analysisResult.description}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-emerald-800 dark:text-emerald-200">
                          {analysisResult.suggestion}
                        </p>
                        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          Model: {analysisResult.model_path}
                        </p>
                        {location && (
                          <div className="mt-4 rounded-2xl bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                            Tọa độ hiện tại: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </div>
                        )}
                        {transcript.trim() && (
                          <div className="mt-3 rounded-2xl bg-slate-100/80 px-4 py-3 text-sm leading-6 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                              Voice Transcript
                            </span>
                            {transcript.trim()}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4 dark:border-emerald-900/60 dark:bg-black/10">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Top Predictions</p>
                        <div className={`mt-3 rounded-2xl bg-gradient-to-r ${activeTheme.progress} p-[1px]`}>
                          <div className="rounded-2xl bg-white px-4 py-4 dark:bg-slate-900">
                            <p className={`text-xs uppercase tracking-[0.18em] ${activeTheme.accent}`}>
                              Top-1 Class
                            </p>
                            <div className="mt-2 flex items-end justify-between gap-3">
                              <div>
                                <p className={`text-3xl font-black capitalize ${activeTheme.accent}`}>
                                  {analysisResult.label}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  Class chính được backend trả về sau khi classify
                                </p>
                              </div>
                              <div className={`rounded-2xl px-4 py-3 text-right ${activeTheme.chip}`}>
                                <p className={`text-xs uppercase tracking-[0.18em] ${activeTheme.accent}`}>
                                  Confidence
                                </p>
                                <p className={`mt-1 text-2xl font-black ${activeTheme.accent}`}>
                                  {(analysisResult.confidence * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {analysisResult.top_predictions.map((prediction, index) => (
                            <div
                              key={`${prediction.label}-${index}`}
                              className={`rounded-2xl px-4 py-3 ${
                                index === 0
                                  ? `${activeTheme.chip} border border-white/80 dark:border-white/10`
                                  : "border border-gray-200/80 bg-white/70 dark:border-gray-700/80 dark:bg-slate-900/40"
                              }`}
                            >
                              <div className="mb-1 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white dark:bg-white dark:text-gray-900">
                                    {index + 1}
                                  </span>
                                  <span className="font-semibold capitalize text-gray-800 dark:text-gray-100">
                                    {prediction.label}
                                  </span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {(prediction.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/60">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${activeTheme.progress}`}
                                  style={{ width: `${Math.max(prediction.confidence * 100, 4)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* STEP 4: SUBMIT */}
            {analysisResult && (
              <div>
                <Card className="border border-green-200/80 bg-gradient-to-r from-green-50 to-blue-50 p-6 dark:border-green-900/60 dark:from-green-950/30 dark:to-blue-950/30">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">4️⃣ Submit Report</h2>
                  <button

                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {isSubmitting ? "📤 Submitting..." : "✅ Submit Report"}
                  </button>
                </Card>
              </div>
            )}
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="space-y-6">
            {/* DANGER ZONE DETECTION */}
            <div>
              <DangerZoneDetection onLocationUpdate={(lat, lng) => setLocation({ lat, lng })} />
            </div>

            {/* HEATMAP */}
            <div>
              <HeatmapDangerMap lat={location?.lat} lng={location?.lng} />
            </div>

            {/* COMMUNITY DATA */}
            <div>
              <CommunityDataTransparency communityReports={communityReports} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
