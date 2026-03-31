import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UploadForm from "../components/UploadForm";
import Navbar from "../components/Navbar";
import HeroVideo from "../components/HeroVideo";

export default function HomePage() {
  const navigate = useNavigate();
  
  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="
        min-h-screen transition-colors duration-300
        bg-gradient-to-br from-green-50 to-white
        dark:from-gray-900 dark:to-gray-800
        text-gray-800 dark:text-gray-100
      "
    >
      <Navbar />

      {/* 🎬 HERO VIDEO (REPLACED OLD HERO) */}
      <HeroVideo onScrollToUpload={scrollToUpload} />

      {/* FEATURES */}
      <section className="py-28 bg-white dark:bg-gray-800 transition">
        <h2 className="text-4xl font-bold text-center mb-16 
                       text-gray-800 dark:text-white">
          Powerful Features
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
          {[
            {
              title: "Upload Evidence",
              desc: "Snap and upload environmental violations instantly.",
              icon: "📸",
              action: () => navigate("/upload"),
            },
            {
              title: "AI Detection",
              desc: "AI identifies pollution types automatically.",
              icon: "🤖",
              action: () => navigate("/upload"),
            },
            {
              title: "Report Issues",
              desc: "Submit evidence with AI analysis and community verification.",
              icon: "📢",
              action: () => navigate("/upload"),
            },
          ].map((f, index) => (
            <motion.button
              key={f.title}
              onClick={f.action}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative group text-left w-full"
            >
              {/* 🔥 BOUNDING BOX AI */}
              <div
                className="
                  absolute inset-0 rounded-3xl
                  border-2 border-green-400/40
                  opacity-0 group-hover:opacity-100
                  animate-pulse
                  transition
                "
              />

              {/* 🔥 SCAN LINE */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div
                  className="
                    w-full h-1 bg-green-400/30
                    opacity-0 group-hover:opacity-100
                    animate-[scan_2s_linear_infinite]
                  "
                />
              </div>

              {/* CARD */}
              <div
                className="
                  p-8 rounded-3xl shadow-lg border
                  bg-gradient-to-br from-green-100 to-white
                  dark:from-gray-700 dark:to-gray-800

                  transform transition duration-300
                  group-hover:scale-105
                  group-hover:shadow-2xl
                "
              >
                <div className="text-4xl mb-4">{f.icon}</div>

                <h3 className="text-xl font-semibold mb-2 
                               text-gray-800 dark:text-white">
                  {f.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300">
                  {f.desc}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* UPLOAD */}
      <section
        id="upload"
        className="
          py-28 flex flex-col items-center px-6
          bg-gradient-to-br from-green-50 to-white
          dark:from-gray-900 dark:to-gray-800
        "
      >
        <h2 className="text-4xl font-bold mb-6 
                       text-gray-800 dark:text-white">
          Report an Issue
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-10 text-center max-w-md">
          Upload an image and let our AI analyze environmental violations.
        </p>

        <div className="w-full max-w-md">
          <UploadForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-8">
        <p className="text-lg">EcoSnap 🌱</p>
        <p className="text-sm text-gray-400 mt-2">
          AI-powered environmental reporting platform
        </p>
      </footer>
    </div>
  );
}