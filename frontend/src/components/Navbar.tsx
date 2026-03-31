import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => setIsMenuOpen(false);

  const goTo = (path: string) => {
    navigate(path);
    closeMenu();
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      ref={menuContainerRef}
      className="
        fixed top-0 left-0 w-full z-50
        flex justify-between items-center
        px-6 py-4
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-md shadow-sm
      "
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Open navigation menu"
          className="
            flex h-11 w-11 items-center justify-center rounded-xl
            bg-gray-200 dark:bg-gray-800
            text-gray-800 dark:text-white
            hover:scale-105 transition
          "
        >
          <span className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 rounded-full bg-current"></span>
            <span className="block h-0.5 w-5 rounded-full bg-current"></span>
            <span className="block h-0.5 w-5 rounded-full bg-current"></span>
          </span>
        </button>

        <h1
          className="text-green-600 font-bold text-lg cursor-pointer hover:opacity-80"
          onClick={() => navigate("/")}
        >
          EcoSnap 🌱
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && (
          <div className="hidden text-sm text-gray-700 dark:text-gray-300 md:block">
            Welcome, <span className="font-semibold">{user?.username}</span>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="
            px-4 py-2 rounded-xl
            bg-gray-200 dark:bg-gray-800
            text-gray-800 dark:text-white
            hover:scale-105 transition
          "
        >
          {theme === "light" ? "🌞 Light" : "🌙 Dark"}
        </button>

        {isAuthenticated ? (
          <>
            <button
              onClick={() => navigate("/upload")}
              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
            >
              📸 Upload
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
                closeMenu();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
            >
              Register
            </button>
          </>
        )}
      </div>

      {isMenuOpen && (
        <div
          onMouseLeave={closeMenu}
          className="absolute left-6 top-[calc(100%+12px)] w-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="space-y-1">
            <button
              onClick={() => goTo("/")}
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-gray-800 transition hover:bg-green-50 dark:text-white dark:hover:bg-gray-800"
            >
              Home
            </button>

            <button
              onClick={() => goTo("/upload")}
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-gray-800 transition hover:bg-green-50 dark:text-white dark:hover:bg-gray-800"
            >
              Upload Evidence
            </button>

            <button
              onClick={() => {
                toggleTheme();
                closeMenu();
              }}
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-gray-800 transition hover:bg-green-50 dark:text-white dark:hover:bg-gray-800"
            >
              {theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </button>

            {isAuthenticated && (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                Signed in as <span className="font-semibold">{user?.username}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
