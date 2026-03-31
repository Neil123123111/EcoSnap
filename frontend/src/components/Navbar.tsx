import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="
        fixed top-0 left-0 w-full z-50
        flex justify-between items-center
        px-6 py-4
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-md shadow-sm
      "
    >
      <h1 
        className="text-green-600 font-bold text-lg cursor-pointer hover:opacity-80"
        onClick={() => navigate("/")}
      >
        EcoSnap 🌱
      </h1>

      <div className="flex items-center gap-4">
        {/* TOGGLE */}
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
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Welcome, <span className="font-semibold">{user?.username}</span>
            </div>
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
    </div>
  );
};

export default Navbar;