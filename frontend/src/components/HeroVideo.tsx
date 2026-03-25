import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  readonly onScrollToUpload: () => void;
};

export default function HeroVideo({ onScrollToUpload }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // đảm bảo video play ngay khi mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        console.warn("Autoplay blocked");
      });
    }
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* VIDEO (LOAD TỪ PUBLIC) */}
      <video
        ref={videoRef}
        className={`
          absolute inset-0 w-full h-full object-cover
          transition-opacity duration-700
          ${isLoaded ? "opacity-100" : "opacity-0"}
        `}
        src="/videos/1851190-uhd_3840_2160_25fps.mp4"   // ✅ dùng public
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setIsLoaded(true)}
      />

      {/* FALLBACK (tránh trắng màn hình) */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* GRADIENT AI EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-blue-500/20" />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white"
        >
          AI for a Cleaner Planet 🌍
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl"
        >
          Detect environmental violations instantly with AI-powered image analysis.
        </motion.p>

        <motion.button
          onClick={onScrollToUpload}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 px-8 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white shadow-lg"
        >
          Start Reporting
        </motion.button>
      </div>
    </section>
  );
}