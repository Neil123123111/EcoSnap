import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp, BellOff, Camera, FileText, Flag, Globe, Heart,
  ImageIcon, Leaf, MapPin, MessageCircle,
  MoreHorizontal, RefreshCw, Send, Share2, Trash2, User, X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  fetchCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  deleteCommunityPost,
  addCommunityComment,
  deleteCommunityComment,
  type CommunityPost,
  type CommunityComment,
} from "../services/api";

// ─── Pure helpers ────────────────────────────────────────────────────────────

function updateLikes(posts: CommunityPost[], id: number, likes: number) {
  return posts.map((p) => (p.id === id ? { ...p, likes } : p));
}
function withoutPost(posts: CommunityPost[], id: number) {
  return posts.filter((p) => p.id !== id);
}
function withComment(posts: CommunityPost[], postId: number, c: CommunityComment) {
  return posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, c] } : p));
}
function withoutComment(posts: CommunityPost[], postId: number, cid: number) {
  return posts.map((p) =>
    p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== cid) } : p
  );
}

function timeAgo(val?: string | null) {
  if (!val) return "";
  const ms = Date.now() - new Date(val).getTime();
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} phút trước`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} ngày trước`;
  return new Date(val).toLocaleDateString("vi-VN");
}

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
];

function Avatar({ name, size = "md" }: Readonly<{ name: string; size?: "sm" | "md" | "lg" }>) {
  const idx = (name.codePointAt(0) ?? 0) % AVATAR_COLORS.length;
  const sz =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";
  return (
    <div
      className={`bg-gradient-to-br ${AVATAR_COLORS[idx]} flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ${sz}`}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: Readonly<{ src: string; onClose: () => void }>) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.88 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.88 }}
        src={src}
        alt="full"
        className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ─── Post dropdown menu ───────────────────────────────────────────────────────

function PostMenu({ isOwner, onDelete, onClose }: Readonly<{
  isOwner: boolean;
  onDelete: () => void;
  onClose: () => void;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute right-0 top-10 z-50 min-w-[200px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-850 dark:shadow-gray-900"
    >
      {isOwner && (
        <button
          onClick={() => { onDelete(); onClose(); }}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" /> Xóa bài viết
        </button>
      )}
      <button
        onClick={onClose}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Flag className="h-4 w-4" /> Báo cáo
      </button>
      <button
        onClick={onClose}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <BellOff className="h-4 w-4" /> Ẩn bài viết
      </button>
    </motion.div>
  );
}

// ─── Animated like button ─────────────────────────────────────────────────────

function LikeButton({ liked, count, onClick }: Readonly<{
  liked: boolean;
  count: number;
  onClick: () => void;
}>) {
  const [bump, setBump] = useState(false);
  function handle() {
    setBump(true);
    setTimeout(() => setBump(false), 320);
    onClick();
  }
  return (
    <button
      onClick={handle}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${
        liked
          ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          : "text-gray-500 hover:bg-gray-100 hover:text-rose-500 dark:text-gray-400 dark:hover:bg-gray-800"
      }`}
    >
      <motion.span
        animate={bump ? { scale: [1, 1.5, 0.9, 1.1, 1] } : {}}
        transition={{ duration: 0.32 }}
        className="text-base"
      >
        <Heart className={`h-4 w-4 transition-all ${liked ? "fill-current" : ""}`} />
      </motion.span>
      <span className="select-none">{liked ? "Đã thích" : "Thích"}</span>
      {count > 0 && (
        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-500 dark:bg-rose-900/30">
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({
  comment, isMine, onDelete,
}: Readonly<{ comment: CommunityComment; isMine: boolean; onDelete: () => void }>) {
  return (
    <div className="group flex items-start gap-2">
      <Avatar name={comment.username} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-[#f0f2f5] px-3 py-2.5 dark:bg-gray-800">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
            {comment.username}
          </p>
          <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
        <div className="mt-1 flex items-center gap-3 pl-2">
          <span className="text-[11px] text-gray-400">{timeAgo(comment.created_at)}</span>
          {isMine && (
            <button
              onClick={onDelete}
              className="text-[11px] font-semibold text-gray-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
            >
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterTab = "all" | "photos" | "mine";

// ─── Main Page ────────────────────────────────────────────────────────────────

const MAX_CHARS = 500;
const COMMENTS_PREVIEW = 3;

export default function CommunityReportPage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // composer
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // interactions
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [commentingId, setCommentingId] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [allComments, setAllComments] = useState<Record<number, boolean>>({});
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // filter
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  // scroll to top
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ── Load
  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const data = await fetchCommunityPosts(50);
        setPosts(data);
      } catch {
        showToast("danger", "Lỗi", "Không thể tải bài đăng.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Composer helpers
  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (e.target.value.length > MAX_CHARS) return;
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearComposer() {
    setContent("");
    setImageFile(null);
    setImagePreview(null);
    setLocation(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      showToast("danger", "Lỗi", "Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
        showToast("success", "Đã lấy vị trí", `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => { setLocLoading(false); showToast("danger", "Lỗi", "Không thể lấy vị trí."); }
    );
  }

  // ── API error handler
  function handleApiError(err: unknown, fallback: string) {
    const msg = err instanceof Error ? err.message : fallback;
    if (msg === "Invalid token" || msg === "Not authenticated") {
      logout(); navigate("/login"); return;
    }
    showToast("danger", "Lỗi", msg);
  }

  // ── Post
  async function handlePost() {
    if (!content.trim() && !imageFile) return;
    if (!token) { navigate("/login"); return; }
    setPosting(true);
    try {
      const newPost = await createCommunityPost(token, {
        content, image: imageFile, latitude: location?.lat, longitude: location?.lng,
      });
      setPosts((prev) => [newPost, ...prev]);
      clearComposer();
      showToast("success", "Đã đăng!", "Bài viết của bạn đã được chia sẻ.");
    } catch (err) {
      handleApiError(err, "Đăng bài thất bại.");
    } finally {
      setPosting(false);
    }
  }

  // ── Like (optimistic)
  async function handleLike(postId: number) {
    if (!token) { navigate("/login"); return; }
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
    try {
      const { likes } = await likeCommunityPost(token, postId);
      setPosts((prev) => updateLikes(prev, postId, likes));
    } catch { /* keep optimistic */ }
  }

  // ── Delete post
  async function handleDeletePost(postId: number) {
    if (!token) return;
    try {
      await deleteCommunityPost(token, postId);
      setPosts((prev) => withoutPost(prev, postId));
      showToast("success", "Đã xóa", "Bài viết đã được xóa.");
    } catch (err) { handleApiError(err, "Xóa thất bại."); }
  }

  // ── Comment
  async function handleComment(postId: number) {
    const text = (commentInputs[postId] ?? "").trim();
    if (!text || !token) return;
    setCommentingId(postId);
    try {
      const comment = await addCommunityComment(token, postId, text);
      setPosts((prev) => withComment(prev, postId, comment));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      handleApiError(err, "Bình luận thất bại.");
    } finally { setCommentingId(null); }
  }

  // ── Delete comment
  async function handleDeleteComment(postId: number, cid: number) {
    if (!token) return;
    try {
      await deleteCommunityComment(token, postId, cid);
      setPosts((prev) => withoutComment(prev, postId, cid));
    } catch { /* silent */ }
  }

  // ── Share
  function handleShare(postId: number) {
    const url = `${window.location.origin}/community#post-${postId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => showToast("success", "Đã sao chép", "Đường dẫn bài viết đã được sao chép."))
      .catch(() => showToast("danger", "Lỗi", "Không thể sao chép đường dẫn."));
  }

  // ── Filtered posts
  const filteredPosts = useMemo(() => {
    if (filterTab === "photos") return posts.filter((p) => !!p.image_url);
    if (filterTab === "mine") return posts.filter((p) => p.username === user?.username);
    return posts;
  }, [posts, filterTab, user]);

  const stats = useMemo(() => ({
    posts: posts.length,
    likes: posts.reduce((s, p) => s + p.likes, 0),
    comments: posts.reduce((s, p) => s + p.comments.length, 0),
  }), [posts]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-950">
        <Navbar />

        {/* Hero banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 pt-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_60%)]" />
          <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  Community Reports
                </h1>
                <p className="text-sm text-emerald-100">
                  Cùng ghi lại và chia sẻ vấn đề môi trường
                </p>
              </div>
              <button
                onClick={() => load(true)}
                disabled={refreshing}
                className="ml-auto flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/30 disabled:opacity-60"
              >
                <motion.span
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={refreshing ? { repeat: Infinity, duration: 0.7, ease: "linear" } : {}}
                  className="inline-flex"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.span>
                {refreshing ? "Đang tải…" : "Làm mới"}
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur">
                <FileText className="h-4 w-4 text-white/80" />
                <div>
                  <p className="text-lg font-extrabold leading-none text-white">{stats.posts}</p>
                  <p className="text-[10px] font-medium text-emerald-100">Bài viết</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur">
                <Heart className="h-4 w-4 text-white/80" />
                <div>
                  <p className="text-lg font-extrabold leading-none text-white">{stats.likes}</p>
                  <p className="text-[10px] font-medium text-emerald-100">Lượt thích</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur">
                <MessageCircle className="h-4 w-4 text-white/80" />
                <div>
                  <p className="text-lg font-extrabold leading-none text-white">{stats.comments}</p>
                  <p className="text-[10px] font-medium text-emerald-100">Bình luận</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">

          {/* Filter tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterTab("all")}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${filterTab === "all" ? "bg-emerald-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
            >
              <Globe className="h-3.5 w-3.5" />
              Tất cả
              {posts.length > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] font-bold ${filterTab === "all" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                  {posts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab("photos")}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition ${filterTab === "photos" ? "bg-emerald-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
            >
              <Camera className="h-3.5 w-3.5" />
              Có ảnh
            </button>
            <button
              onClick={() => setFilterTab("mine")}
              disabled={!isAuthenticated}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition disabled:opacity-40 ${filterTab === "mine" ? "bg-emerald-500 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
            >
              <User className="h-3.5 w-3.5" />
              Của tôi
            </button>
          </div>

          {/* ─── Composer ─── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
          >
            <div className="flex items-start gap-3 p-4 pb-3">
              {user
                ? <Avatar name={user.username} size="lg" />
                : <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              }
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder={
                  isAuthenticated
                    ? `Bạn muốn chia sẻ gì, ${user?.username}?`
                    : "Đăng nhập để đăng bài…"
                }
                disabled={!isAuthenticated}
                rows={2}
                className="w-full resize-none rounded-2xl bg-[#f0f2f5] px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 disabled:opacity-50"
              />
            </div>

            {/* Image preview */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative mx-4 mb-3 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                  <img src={imagePreview} alt="preview" className="max-h-72 w-full object-cover" />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {imageFile && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white backdrop-blur">
                      {(imageFile.size / 1024).toFixed(0)} KB
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Location tag */}
            <AnimatePresence>
              {location && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="font-medium">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                  <button onClick={() => setLocation(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><X className="h-3.5 w-3.5" /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex gap-0.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAuthenticated}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30 disabled:opacity-40"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Ảnh</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <button
                  onClick={handleGetLocation}
                  disabled={!isAuthenticated || locLoading}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30 disabled:opacity-40"
                >
                  <motion.span
                    animate={locLoading ? { rotate: 360 } : {}}
                    transition={locLoading ? { repeat: Infinity, duration: 0.7, ease: "linear" } : {}}
                    className="inline-flex"
                  >
                    <MapPin className="h-4 w-4" />
                  </motion.span>
                  <span className="hidden sm:inline">Vị trí</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={content.length > MAX_CHARS * 0.9 ? "#ef4444" : "#10b981"}
                      strokeWidth="3"
                      strokeDasharray={`${(content.length / MAX_CHARS) * 94.2} 94.2`}
                      strokeLinecap="round"
                    />
                    {content.length > MAX_CHARS * 0.8 && (
                      <text x="18" y="22" textAnchor="middle" className="text-[9px]" fill={content.length > MAX_CHARS * 0.9 ? "#ef4444" : "#6b7280"} fontSize="9">
                        {MAX_CHARS - content.length}
                      </text>
                    )}
                  </svg>
                )}
                <button
                  onClick={isAuthenticated ? handlePost : () => navigate("/login")}
                  disabled={posting || (!content.trim() && !imageFile)}
                  className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-bold text-white shadow-md shadow-emerald-200/50 transition hover:bg-emerald-600 active:scale-95 disabled:opacity-50 dark:shadow-none"
                >
                  {posting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
                      />
                      Đang đăng…
                    </span>
                  ) : "Đăng"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ─── Feed ─── */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-900">
                  <div className="flex gap-3 p-5">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 w-36 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="h-3 w-24 rounded-full bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                  <div className="space-y-2 px-5 pb-4">
                    <div className="h-4 rounded-full bg-gray-100 dark:bg-gray-800" />
                    <div className="h-4 w-3/4 rounded-full bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="h-52 bg-gray-100 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-black/5 dark:bg-gray-900"
            >
              <Leaf className="h-12 w-12 text-emerald-400" />
              <p className="font-bold text-gray-700 dark:text-gray-300">
                {filterTab === "mine" ? "Bạn chưa có bài viết nào." : "Chưa có bài viết nào."}
              </p>
              <p className="text-sm text-gray-400">
                Hãy là người đầu tiên chia sẻ một điều gì đó!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {filteredPosts.map((post) => {
                  const liked = likedPosts.has(post.id);
                  const showAll = allComments[post.id];
                  const hiddenCount = post.comments.length - COMMENTS_PREVIEW;
                  const visibleComments = showAll
                    ? post.comments
                    : post.comments.slice(-COMMENTS_PREVIEW);

                  return (
                    <motion.article
                      id={`post-${post.id}`}
                      key={post.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between px-4 pt-4 pb-2">
                        <div className="flex gap-3">
                          <Avatar name={post.username} size="lg" />
                          <div>
                            <p className="font-bold leading-tight text-gray-900 dark:text-white">
                              {post.username}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-gray-400 dark:text-gray-500">
                              <span>{timeAgo(post.created_at)}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> Công khai</span>
                              {post.latitude != null && post.longitude != null && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-0.5 text-emerald-500 font-medium">
                                    <MapPin className="h-3 w-3" /> {post.latitude.toFixed(3)}, {post.longitude.toFixed(3)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ⋯ menu */}
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId((p) => (p === post.id ? null : post.id))}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          <AnimatePresence>
                            {menuOpenId === post.id && (
                              <PostMenu
                                isOwner={user?.username === post.username}
                                onDelete={() => handleDeletePost(post.id)}
                                onClose={() => setMenuOpenId(null)}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Content */}
                      {post.content && (
                        <p className="px-4 pb-3 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {post.content}
                        </p>
                      )}

                      {/* Image */}
                      {post.image_url && (
                        <button
                          onClick={() => setLightboxSrc(post.image_url ?? null)}
                          className="block w-full cursor-zoom-in overflow-hidden border-y border-gray-100 dark:border-gray-800"
                        >
                          <img
                            src={post.image_url}
                            alt="post"
                            loading="lazy"
                            className="w-full max-h-[520px] object-cover transition duration-200 hover:brightness-95"
                          />
                        </button>
                      )}

                      {/* Stats row */}
                      {(post.likes > 0 || post.comments.length > 0) && (
                        <div className="flex items-center justify-between px-4 py-1.5 text-[13px] text-gray-400 dark:text-gray-500">
                          {post.likes > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
                              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                            </div>
                              <span>{post.likes}</span>
                            </div>
                          )}
                          {post.comments.length > 0 && (
                            <button
                              onClick={() => setExpandedComments((p) => ({ ...p, [post.id]: !p[post.id] }))}
                              className="ml-auto font-medium transition hover:underline"
                            >
                              {post.comments.length} bình luận
                            </button>
                          )}
                        </div>
                      )}

                      {/* Action bar */}
                      <div className="flex gap-1 border-t border-gray-100 px-2 py-1 dark:border-gray-800">
                        <LikeButton liked={liked} count={0} onClick={() => handleLike(post.id)} />
                        <button
                          onClick={() => setExpandedComments((p) => ({ ...p, [post.id]: !p[post.id] }))}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Bình luận</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-emerald-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Chia sẻ</span>
                        </button>
                      </div>

                      {/* Comments panel */}
                      <AnimatePresence>
                        {expandedComments[post.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                          >
                            <div className="space-y-2 px-4 py-3">
                              {/* Load more */}
                              {!showAll && hiddenCount > 0 && (
                                <button
                                  onClick={() => setAllComments((p) => ({ ...p, [post.id]: true }))}
                                  className="mb-1 text-sm font-bold text-gray-500 transition hover:text-gray-700 hover:underline dark:text-gray-400"
                                >
                                  Xem {hiddenCount} bình luận trước
                                </button>
                              )}

                              {visibleComments.map((c) => (
                                <CommentItem
                                  key={c.id}
                                  comment={c}
                                  isMine={user?.username === c.username}
                                  onDelete={() => handleDeleteComment(post.id, c.id)}
                                />
                              ))}

                              {/* Comment input */}
                              <div className="flex items-center gap-2 pt-1">
                                {user && <Avatar name={user.username} size="sm" />}
                                <div className="flex flex-1 items-center gap-2 rounded-full bg-[#f0f2f5] px-4 dark:bg-gray-800">
                                  <input
                                    value={commentInputs[post.id] ?? ""}
                                    onChange={(e) => setCommentInputs((p) => ({ ...p, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleComment(post.id);
                                      }
                                    }}
                                    placeholder={isAuthenticated ? "Viết bình luận…" : "Đăng nhập để bình luận"}
                                    disabled={!isAuthenticated}
                                    className="flex-1 bg-transparent py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none dark:text-gray-200"
                                  />
                                  <AnimatePresence>
                                    {(commentInputs[post.id] ?? "").trim() && (
                                      <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        onClick={() => handleComment(post.id)}
                                        disabled={commentingId === post.id}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs text-white transition hover:bg-emerald-600 disabled:opacity-50"
                                      >
                                        {commentingId === post.id ? <span className="text-[10px] leading-none">…</span> : <Send className="h-3 w-3" />}
                                      </motion.button>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>

                              {!isAuthenticated && (
                                <p className="text-center text-xs text-gray-400">
                                  <button onClick={() => navigate("/login")} className="font-semibold text-blue-500 hover:underline">
                                    Đăng nhập
                                  </button>{" "}
                                  để bình luận.
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-600 dark:shadow-none"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
