import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  UploadCloud, Search, Trash2, Image as ImageIcon, 
  MapPin, Send, ThumbsUp, ThumbsDown, Target, Coins, AlertCircle
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useToast } from '../context/ToastContext';

// --- TYPES & INTERFACES ---
interface ScanResult {
  class_name: string;
  confidence: number;
}

type FeedbackType = 'true_positive' | 'false_positive' | 'false_negative' | null;

interface AIFeedbackForm {
  type: FeedbackType;
  actualTrashType: string;
  percentage: number;
  comment: string;
}

export default function UploadEvidencePage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATES ---
  // 1. File & Location
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('Đang lấy vị trí...');

  // 2. Processing States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // 3. AI & Feedback Data
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [feedback, setFeedback] = useState<AIFeedbackForm>({
    type: null,
    actualTrashType: '',
    percentage: 0,
    comment: ''
  });
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [isFeedbackCompleted, setIsFeedbackCompleted] = useState<boolean>(false);

  // --- EFFECTS ---
  useEffect(() => {
    initGeolocation();
  }, []);

  // --- LOGIC HANDLERS ---
  const initGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Trình duyệt không hỗ trợ định vị');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationStatus('Đã gắn thẻ vị trí hiện tại');
      },
      (err) => {
        setLocationStatus('Không thể lấy vị trí (Vui lòng cấp quyền)');
        showToast('warning', 'Lỗi vị trí', err.message);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('danger', 'Lỗi định dạng', 'Vui lòng chọn file hình ảnh hợp lệ (JPEG, PNG).');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    resetAIStates();
  };

  const resetAIStates = () => {
    setScanResult(null);
    setFeedback({ type: null, actualTrashType: '', percentage: 0, comment: '' });
    setPointsEarned(0);
    setIsFeedbackCompleted(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    resetAIStates();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScanImage = async () => {
    if (!selectedFile) return;
    setIsScanning(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/report/classify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Không thể phân tích hình ảnh.');

      const data = (await response.json()) as ScanResult;
      setScanResult(data);
      showToast('success', 'Phân tích hoàn tất', `Phát hiện: ${data.class_name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối AI server.';
      showToast('danger', 'Lỗi AI', msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFeedbackSelect = (type: FeedbackType) => {
    setFeedback((prev) => ({ ...prev, type }));
    
    // Auto-complete if True Positive (No form needed)
    if (type === 'true_positive') {
      completeFeedback();
    } else {
      // Open form, reset completion status
      setIsFeedbackCompleted(false);
      setPointsEarned(0);
    }
  };

  const completeFeedback = () => {
    setIsFeedbackCompleted(true);
    setPointsEarned(50);
    showToast('success', '+50 EcoPoints', 'Cảm ơn bạn đã đóng góp cải thiện hệ thống AI!');
  };

  const handleSubmitFinalReport = async () => {
    if (!selectedFile || !scanResult) return;
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('ai_label', scanResult.class_name);
    formData.append('ai_confidence', scanResult.confidence.toString());
    
    if (latitude && longitude) {
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
    }

    // Append AI Training Feedback Data
    if (isFeedbackCompleted && feedback.type) {
      formData.append('feedback_type', feedback.type);
      if (feedback.type !== 'true_positive') {
        formData.append('actual_trash_type', feedback.actualTrashType);
        formData.append('trash_percentage', feedback.percentage.toString());
        formData.append('feedback_comment', feedback.comment);
      }
      formData.append('earned_points', pointsEarned.toString());
    }

    try {
      const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8001';
      const token = localStorage.getItem('token'); 
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${apiUrl}/report/submit`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) throw new Error('Không thể lưu report.');

      showToast('success', 'Đã gửi Report', 'Dữ liệu đã được cập nhật lên bản đồ cộng đồng.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gửi report.';
      showToast('danger', 'Lỗi hệ thống', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS (Clean Code Pattern) ---

  const renderUploadArea = () => (
    <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80" hover={false}>
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <MapPin className={`h-4 w-4 ${latitude ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
        {locationStatus} {latitude && longitude ? `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})` : ''}
      </div>

      {!previewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
          <span className="mt-4 block text-base font-semibold text-slate-900 dark:text-slate-100">Nhấn hoặc kéo thả ảnh vào đây</span>
          <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">Hỗ trợ PNG, JPG (Tối đa 10MB)</span>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex justify-center max-h-[400px]">
          <img src={previewUrl} alt="Evidence" className="object-contain max-h-[400px]" />
          <button 
            onClick={clearSelection}
            className="absolute top-4 right-4 p-3 bg-rose-600/90 text-white rounded-2xl hover:bg-rose-700 transition-colors backdrop-blur"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {previewUrl && !scanResult && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleScanImage}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {isScanning ? <span className="animate-pulse">Đang quét ảnh...</span> : <><Search className="h-5 w-5" /> Quét ảnh bằng AI</>}
          </button>
        </div>
      )}
    </Card>
  );

  const renderFeedbackSection = () => {
    if (!scanResult) return null;

    return (
      <div className="mt-6 border-t border-emerald-200/50 dark:border-emerald-800/50 pt-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" /> Đánh giá AI để nhận +50 EcoPoints
        </h4>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={() => handleFeedbackSelect('true_positive')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${feedback.type === 'true_positive' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50'}`}
          >
            <ThumbsUp className="h-4 w-4" /> Chính xác
          </button>
          <button 
            onClick={() => handleFeedbackSelect('false_positive')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${feedback.type === 'false_positive' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50'}`}
          >
            <ThumbsDown className="h-4 w-4" /> Sai loại rác
          </button>
          <button 
            onClick={() => handleFeedbackSelect('false_negative')}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${feedback.type === 'false_negative' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50'}`}
          >
            <AlertCircle className="h-4 w-4" /> Có rác nhưng AI bỏ sót
          </button>
        </div>

        {/* Pop-up Form for Incorrect Detections */}
        {(feedback.type === 'false_positive' || feedback.type === 'false_negative') && !isFeedbackCompleted && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Loại rác thực tế là gì?</label>
              <input 
                type="text" 
                placeholder="VD: Nhựa, Thủy tinh, Giấy..."
                value={feedback.actualTrashType}
                onChange={(e) => setFeedback({...feedback, actualTrashType: e.target.value})}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tỷ lệ rác trong ảnh (%)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="0" max="100" step="10"
                  value={feedback.percentage}
                  onChange={(e) => setFeedback({...feedback, percentage: parseInt(e.target.value)})}
                  className="w-full accent-emerald-500"
                />
                <span className="font-bold text-emerald-600 dark:text-emerald-400 w-12">{feedback.percentage}%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ghi chú thêm (Tùy chọn)</label>
              <textarea 
                rows={2} placeholder="Mô tả bối cảnh để AI học tốt hơn..."
                value={feedback.comment}
                onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <button 
              onClick={completeFeedback}
              disabled={!feedback.actualTrashType}
              className="w-full mt-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition"
            >
              Hoàn tất đánh giá
            </button>
          </div>
        )}
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,216,102,0.28),_transparent_32%),linear-gradient(180deg,_#fffaf0_0%,_#f8fafc_30%,_#eef4ff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.1),_transparent_24%),linear-gradient(180deg,_#07111b_0%,_#0f172a_45%,_#111827_100%)] dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-4xl px-5 pb-24 pt-28">
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">Báo cáo vấn đề môi trường</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Tải ảnh lên để AI tự động phân loại rác thải. Tham gia đánh giá AI để nhận điểm thưởng EcoPoints.
          </p>
        </section>

        <div className="space-y-6">
          {renderUploadArea()}

          {scanResult && (
            <Card className="rounded-[28px] border border-emerald-200/80 bg-emerald-50/40 p-6 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20 animate-in fade-in" hover={false}>
              
              {/* Top Section: AI Result & Points Earned */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                    <ImageIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hệ thống AI nhận diện</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">YOLOv8 + Custom Classifier</p>
                  </div>
                </div>
                {pointsEarned > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-4 py-2 rounded-full font-bold animate-in zoom-in">
                    <Coins className="h-5 w-5" /> +{pointsEarned} EcoPoints
                  </div>
                )}
              </div>

              {/* Data Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Loại phát hiện</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white capitalize">{scanResult.class_name}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Độ tin cậy</p>
                  <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{Math.round(scanResult.confidence * 100)}%</p>
                </div>
              </div>
              
              {/* Modular Feedback Section */}
              {renderFeedbackSection()}
              
              {/* Bottom Action: Final Submit */}
              <div className="mt-6 flex justify-end pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                <button 
                  onClick={handleSubmitFinalReport}
                  disabled={isSubmitting || (feedback.type !== null && !isFeedbackCompleted)}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.24)] transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang cập nhật lên bản đồ...' : <><Send className="h-5 w-5" /> Đóng góp Report & Nhận điểm</>}
                </button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}