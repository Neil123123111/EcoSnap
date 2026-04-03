import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart2, Globe, Heart, Leaf, MapPin, MessageCircle } from "lucide-react";
import Card from "./Card";
import type { CommunityPost } from "../services/api";

interface CommunityDataTransparencyProps {
  readonly communityReports?: CommunityPost[];
}

function timeAgo(value?: string | null) {
  if (!value) return "Unknown";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return value;
  const diffMinutes = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.round(diffHours / 24)} ngày trước`;
}

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-sky-500",
];

function MiniAvatar({ name }: Readonly<{ name: string }>) {
  const idx = (name.codePointAt(0) ?? 0) % AVATAR_COLORS.length;
  return (
    <div
      className={`bg-gradient-to-br ${AVATAR_COLORS[idx]} flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white`}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function CommunityDataTransparency({ communityReports = [] }: CommunityDataTransparencyProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-emerald-500" />
          <span>Community Reports</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {communityReports.length}
          </span>
        </h3>
        <button
          onClick={() => navigate("/community")}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
        >
          Xem tất cả →
        </button>
      </div>

      {/* List */}
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {communityReports.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Leaf className="h-8 w-8 text-emerald-400" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Chưa có báo cáo nào. Hãy đăng báo cáo đầu tiên!
            </p>
          </div>
        ) : (
          communityReports.map((post, idx) => {
            const hasCoords = post.latitude != null && post.longitude != null;
            const contentPreview = post.content.length > 60
              ? `${post.content.slice(0, 60)}…`
              : post.content;

            return (
              <motion.button
                key={post.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => navigate(`/community#post-${post.id}`)}
                className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:bg-gray-700"
              >
                {/* Thumbnail or Avatar */}
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt="post"
                    className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-600"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Globe className="h-6 w-6 text-emerald-500" />
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  {/* Author + time */}
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <MiniAvatar name={post.username} />
                    <span className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {post.username}
                    </span>
                    <span className="ml-auto flex-shrink-0 text-[11px] text-gray-400">
                      {timeAgo(post.created_at)}
                    </span>
                  </div>

                  {/* Content preview */}
                  {post.content && (
                    <p className="mb-1 text-[12px] leading-snug text-gray-600 dark:text-gray-400">
                      {contentPreview}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-rose-400" /> {post.likes}</span>
                    <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3 text-blue-400" /> {post.comments.length}</span>
                    {hasCoords && (
                      <span className="flex items-center gap-0.5 truncate text-emerald-500">
                        <MapPin className="h-3 w-3" /> {post.latitude!.toFixed(2)}, {post.longitude!.toFixed(2)}
                      </span>
                    )}
                    <span className="ml-auto text-gray-300 dark:text-gray-600">
                      #{post.id}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t pt-3 dark:border-gray-700">
        <button
          onClick={() => navigate("/community")}
          className="w-full rounded-xl py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
        >
          View All Reports →
        </button>
      </div>
    </Card>
  );
}
