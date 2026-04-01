import React, { useState } from "react";
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

export default function UploadEvidencePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(!isAuthenticated);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreview(preview.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      alert("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    try {
      // TODO: Call actual API
      const mockResult = {
        label: "trash",
        confidence: 0.92,
        severity: "high",
        description: "Plastic waste detected in the area",
        suggestion: "Report to local authorities for cleanup",
        boxes: [{ x1: 100, y1: 100, x2: 300, y2: 300 }],
      };

      setAnalysisResult(mockResult);
    } catch (error) {
      alert("Analysis failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!files[0] || !analysisResult) {
      alert("Please analyze an image first");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("transcript", transcript);
      formData.append("latitude", location?.lat?.toString() || "0");
      formData.append("longitude", location?.lng?.toString() || "0");

      // TODO: Call actual submit API
      console.log("Submitting report...");

      setAnalysisResult(null);
      setFiles([]);
      setPreview([]);
      setTranscript("");
      alert("Report submitted successfully!");
    } catch (error) {
      alert("Submission failed: " + (error instanceof Error ? error.message : "Unknown error"));
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

                {analysisResult && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="danger">{analysisResult.severity.toUpperCase()}</Badge>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {(analysisResult.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                    <p className="font-semibold mb-2 text-gray-900 dark:text-white">{analysisResult.label}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{analysisResult.description}</p>
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
              <CommunityDataTransparency />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
