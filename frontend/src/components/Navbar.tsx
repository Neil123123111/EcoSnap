import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

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
      <h1 className="text-green-600 font-bold text-lg">
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

        <button className="bg-green-500 text-white px-4 py-2 rounded-xl">
          Report
        </button>
      </div>
    </div>
  );
};

export default Navbar;