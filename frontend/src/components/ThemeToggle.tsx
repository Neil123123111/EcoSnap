import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-xl 
                 bg-gray-200 dark:bg-gray-800 
                 text-gray-800 dark:text-white 
                 hover:scale-105 transition"
    >
      {/* ICON */}
      {theme === "light" ? "🌞" : "🌙"}

      {/* TEXT */}
      <span className="font-medium">
        {theme === "light" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;