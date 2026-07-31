import { Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import useAuthStore from "../../store/useAuthStore";
import { FiLogOut, FiUser, FiArrowLeft, FiShield, FiSun, FiMoon } from "react-icons/fi";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const photoUrl = user?.profilePhotoUrl
    ? (user.profilePhotoUrl.startsWith("http") ? user.profilePhotoUrl : `http://localhost:5000${user.profilePhotoUrl}`)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 font-body flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-white/80 dark:bg-[#0f172a]/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-amber-400 font-bold uppercase tracking-widest bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Admin Operations</span>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors"
              title="Toggle Theme"
            >
              {theme === "dark" ? <FiSun className="text-xl text-amber-400" /> : <FiMoon className="text-xl text-blue-700" />}
            </button>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
            >
              <FiArrowLeft className="text-sm" />
              <span>Market Home</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border-2 border-blue-600/20 dark:border-amber-500/30 bg-blue-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-blue-600 dark:text-amber-400 shadow-sm">
                {photoUrl ? (
                  <img src={photoUrl} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="text-lg" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                  {user?.name || "System Admin"}
                </h4>
                <span className="text-[10px] text-blue-600 dark:text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <FiShield className="text-[9px]" /> Administrator
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              title="Logout"
            >
              <FiLogOut className="text-sm" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page View */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;