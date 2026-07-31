import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiShoppingCart, FiUser, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiShield, FiGlobe, FiSmartphone
} from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { useSettings } from "../hooks";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Farm Inputs Market", path: "/shop" },
  { name: "Farming Seasons", path: "/collection" },
  { name: "About AgriSmart", path: "/about" },
];

const CATEGORY_SHORTCUTS = [
  { label: "Seeds", category: "SEEDS" },
  { label: "Fertilizers", category: "FERTILIZERS" },
  { label: "Pesticides", category: "PESTICIDES" },
  { label: "Farm Tools", category: "FARM_TOOLS" },
  { label: "Irrigation", category: "IRRIGATION_EQUIPMENT" },
  { label: "Animal Feed", category: "ANIMAL_FEED" },
];

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { storeName } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const dashboardPath = user?.role === "ADMIN" ? "/admin" : user?.role === "SUPPLIER" ? "/supplier" : "/my-orders";

  return (
    <header className="fixed top-0 left-0 w-full z-[1000] font-body transition-all duration-300">
      {/* Top Banner Bar for Mobile Payments */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] font-bold py-1.5 px-6 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <FiSmartphone className="text-amber-400" />
          <span>Mobile Money Payments Enabled: EVC Plus, Zaad & Sahal</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-emerald-200">
          <span>Verified Agrovet Suppliers</span>
          <span>•</span>
          <span>Gu & Dayr Season Stock Available</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "py-3 bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-xl border-b border-emerald-900/10 dark:border-white/10 shadow-lg"
            : "py-4 bg-white/80 dark:bg-[#0a0f1d]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <div className="flex-1 flex items-center lg:hidden">
            <button
              className="p-2 text-2xl text-slate-800 dark:text-slate-100 hover:text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20 group-hover:rotate-6 transition-transform">
              <FiGlobe />
            </div>
            <div className="text-left">
              <span className="font-black text-lg tracking-wider text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors block leading-tight">
                AGRISMART
              </span>
              <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                Inputs Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 ml-12">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-xs font-extrabold uppercase tracking-widest transition-all ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 border-b-2 border-amber-500 pb-1"
                      : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Actions (Cart, Theme, Auth) */}
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-all"
              aria-label="Shopping Cart"
            >
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-amber-500 text-slate-950 font-black text-[11px] rounded-full flex items-center justify-center shadow-md shadow-amber-500/30 animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <FiSun className="text-xl text-amber-400" /> : <FiMoon className="text-xl text-emerald-700" />}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold uppercase tracking-wider transition-all"
                >
                  <FiShield className="text-amber-500" />
                  <span>{user.role === "ADMIN" ? "Admin Console" : user.role === "SUPPLIER" ? "Supplier Portal" : "My Orders"}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Log out"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-600/20"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Category Quick Bar */}
        <div className="hidden md:flex items-center justify-center gap-6 py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {CATEGORY_SHORTCUTS.map((sc) => (
            <Link
              key={sc.category}
              to={`/shop?category=${sc.category}`}
              className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors"
            >
              {sc.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[999] lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className="w-4/5 max-w-xs h-full bg-white dark:bg-[#0a0f1d] p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 border-r border-slate-200 dark:border-slate-800 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                AGRISMART MARKET
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-slate-500 dark:text-slate-400 text-xl"
              >
                <FiX />
              </button>
            </div>

            <div className="flex flex-col space-y-3">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-xs font-bold uppercase tracking-widest p-2.5 rounded-xl transition-colors ${
                      isActive
                        ? "bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-black"
                        : "text-slate-700 dark:text-slate-300 hover:text-emerald-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Input Categories
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                {CATEGORY_SHORTCUTS.map((sc) => (
                  <Link
                    key={sc.category}
                    to={`/shop?category=${sc.category}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-emerald-500"
                  >
                    {sc.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider"
            >
              {theme === "dark" ? <FiSun className="text-amber-400" /> : <FiMoon className="text-emerald-600" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            {user ? (
              <div className="space-y-2">
                <Link
                  to={dashboardPath}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  <FiShield /> Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider"
                >
                  <FiLogOut /> Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;