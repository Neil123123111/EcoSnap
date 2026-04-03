import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Camera,
  Moon,
  Sun,
  User,
  Home,
  LayoutDashboard,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  MapPin,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home, color: "text-emerald-500" },
  { path: "/upload", label: "Upload Evidence", icon: Camera, color: "text-violet-500" },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { path: "/community", label: "Community Report", icon: Users, color: "text-rose-500" },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => setIsMenuOpen(false);

  const goTo = (path: string) => {
    navigate(path);
    closeMenu();
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div
      ref={menuContainerRef}
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Open navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 transition-all duration-200"
        >
          <span className="flex flex-col gap-[5px]">
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 origin-center ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0 scale-x-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 origin-center ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </span>
        </button>

        <button
          onClick={() => navigate("/")}
          className="text-emerald-600 font-extrabold text-xl tracking-tight hover:opacity-80 transition"
        >
          🌿 EcoSnap
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated && (
          <div className="hidden text-sm text-gray-700 dark:text-gray-300 md:block">
            Welcome,{" "}
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-1.5 font-semibold hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="h-6 w-6 rounded-full object-cover ring-2 ring-emerald-200" />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-bold text-white">
                  {(user?.display_name || user?.username || "?")[0].toUpperCase()}
                </span>
              )}
              {user?.display_name || user?.username}
            </button>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm font-medium"
        >
          {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="hidden sm:inline">{theme === "light" ? "Light" : "Dark"}</span>
        </button>

        {isAuthenticated ? (
          <>
            <button
              onClick={() => navigate("/upload")}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition text-sm font-semibold shadow-sm shadow-emerald-200 dark:shadow-none"
            >
              <Camera className="h-4 w-4" />Upload
            </button>
            <button
              onClick={() => { logout(); navigate("/"); closeMenu(); }}
              className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200 dark:border-red-800 px-3 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-semibold"
            >
              <LogIn className="h-4 w-4" />Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition text-sm font-semibold shadow-sm"
            >
              <UserPlus className="h-4 w-4" />Register
            </button>
          </>
        )}
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div className="absolute left-4 top-[calc(100%+8px)] w-80 rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
          {/* User header */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-b border-emerald-100/60 dark:border-emerald-800/30">
              <button onClick={() => goTo("/profile")} className="shrink-0">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-300 dark:ring-emerald-600" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-base font-bold text-white ring-2 ring-emerald-300 dark:ring-emerald-600">
                    {(user?.display_name || user?.username || "?")[0].toUpperCase()}
                  </div>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {user?.display_name || user?.username}
                </p>
                {user?.display_name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                )}
              </div>
              <button
                onClick={() => goTo("/profile")}
                className="shrink-0 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Edit
              </button>
            </div>
          )}

          {/* Nav items */}
          <div className="p-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-gray-100 dark:bg-gray-800"}`}>
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : item.color}`} />
                  </span>
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}

            {isAuthenticated && (
              <button
                onClick={() => goTo("/profile")}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  location.pathname === "/profile"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${location.pathname === "/profile" ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-gray-100 dark:bg-gray-800"}`}>
                  <User className={`h-4 w-4 ${location.pathname === "/profile" ? "text-emerald-600" : "text-indigo-500"}`} />
                </span>
                Profile
                {location.pathname === "/profile" && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="mx-3 border-t border-gray-100 dark:border-gray-800" />

          {/* Theme + logout */}
          <div className="p-2">
            <button
              onClick={() => { toggleTheme(); closeMenu(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                {theme === "light"
                  ? <Moon className="h-4 w-4 text-indigo-500" />
                  : <Sun className="h-4 w-4 text-amber-400" />}
              </span>
              {theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </button>

            {isAuthenticated && (
              <button
                onClick={() => { logout(); navigate("/"); closeMenu(); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30">
                  <LogOut className="h-4 w-4 text-red-500" />
                </span>
                Logout
              </button>
            )}

            {!isAuthenticated && (
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => goTo("/login")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <LogIn className="h-4 w-4" />Login
                </button>
                <button
                  onClick={() => goTo("/register")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition"
                >
                  <UserPlus className="h-4 w-4" />Register
                </button>
              </div>
            )}
          </div>

          {/* App version footer */}
          <div className="flex items-center gap-1.5 px-4 pb-3 text-[11px] text-gray-400 dark:text-gray-600">
            <MapPin className="h-3 w-3" />
            EcoSnap — Environmental AI Platform
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
