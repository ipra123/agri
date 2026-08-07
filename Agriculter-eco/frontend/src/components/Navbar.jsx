import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiShield,
  FiGlobe,
  FiSmartphone,
} from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { useSettings } from "../hooks";
import brandLogo from "../assets/logo.png";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Marketplace", path: "/shop" },
  { name: "Suppliers", path: "/suppliers" },
  { name: "Collections", path: "/collection" },
  { name: "About", path: "/about" },
];

const CATEGORY_SHORTCUTS = [
  { label: "Seeds", category: "SEEDS" },
  { label: "Fertilizers", category: "FERTILIZERS" },
  { label: "Pesticides", category: "PESTICIDES" },
  { label: "Tools", category: "FARM_TOOLS" },
  { label: "Irrigation", category: "IRRIGATION_EQUIPMENT" },
  { label: "Feed", category: "ANIMAL_FEED" },
];

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { storeName } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme !== "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const dashboardPath = user?.role === "ADMIN" ? "/admin" : user?.role === "SUPPLIER" ? "/supplier" : "/my-orders";

  const navBase = "text-[11px] font-extrabold uppercase tracking-[0.2em] transition-colors";
  const navActive = "text-[color:var(--primary)]";
  const navIdle = "text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]";

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] font-body">
      <div className="bg-[color:var(--primary)] text-white/90 text-[11px] font-bold tracking-[0.18em] uppercase">
        <div className="section-shell flex items-center justify-between py-2 gap-4">
          <div className="flex items-center gap-2">
            <FiSmartphone className="text-[color:var(--accent)]" />
            <span>Mobile money checkout enabled</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-white/70">
            <span>Verified suppliers only</span>
            <span>•</span>
            <span>Season-ready inventory</span>
          </div>
        </div>
      </div>

      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? "glass-card py-3"
            : "bg-white/78 dark:bg-black/20 backdrop-blur-xl border-b border-[color:var(--border-color)] py-4"
        }`}
      >
        <div className="section-shell flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              className="rounded-full border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-2 text-lg text-[color:var(--text-main)]"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={brandLogo}
              alt={storeName}
              className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[color:var(--border-color)] shadow-md"
            />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-[0.22em] text-[color:var(--text-main)]">
                  {storeName || "AGRIECO"}
                </span>
                <FiGlobe className="text-[color:var(--primary)]" />
              </div>
              <span className="text-[10px] font-extrabold tracking-[0.28em] uppercase text-[color:var(--text-muted)]">
                farm inputs marketplace
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `${navBase} ${isActive ? navActive : navIdle}`}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              className="relative grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
            >
              <FiShoppingCart className="text-lg" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-[color:var(--accent)] px-1.5 py-0.5 text-[10px] font-black text-[#111]">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)] transition hover:border-[color:var(--accent)]"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <FiSun className="text-lg text-[color:var(--accent)]" /> : <FiMoon className="text-lg text-[color:var(--primary)]" />}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-3 pl-3">
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--text-main)] transition hover:border-[color:var(--primary)]"
                >
                  <FiShield className="text-[color:var(--primary)]" />
                  <span>{user.role === "ADMIN" ? "Admin" : user.role === "SUPPLIER" ? "Supplier" : "Orders"}</span>
                </Link>
                <button
                  onClick={logout}
                  className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] text-[color:var(--text-muted)] transition hover:text-red-500"
                  title="Log out"
                >
                  <FiLogOut className="text-lg" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[color:var(--primary-hover)]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:block border-t border-[color:var(--border-color)] bg-white/55 dark:bg-black/15">
          <div className="section-shell flex items-center justify-center gap-6 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            {CATEGORY_SHORTCUTS.map((item) => (
              <Link
                key={item.category}
                to={`/shop?category=${item.category}`}
                className="transition hover:text-[color:var(--primary)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[999] bg-black/55 backdrop-blur-md transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className="flex h-full w-4/5 max-w-xs flex-col justify-between border-r border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-6 text-left shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <img src={brandLogo} alt={storeName} className="h-10 w-10 rounded-xl object-cover" />
                <div>
                  <p className="font-black tracking-[0.18em] text-[color:var(--text-main)]">AGRIECO</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">farm inputs</p>
                </div>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="text-xl text-[color:var(--text-muted)]">
                <FiX />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition ${
                      isActive
                        ? "bg-[color:var(--primary)] text-white"
                        : "bg-[color:var(--surface-soft)] text-[color:var(--text-main)]"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            <div className="border-t border-[color:var(--border-color)] pt-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                Quick Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_SHORTCUTS.map((item) => (
                  <Link
                    key={item.category}
                    to={`/shop?category=${item.category}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-3 py-2 text-[11px] font-bold text-[color:var(--text-main)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-[color:var(--border-color)] pt-4">
            <button
              onClick={() => {
                setTheme((current) => (current === "dark" ? "light" : "dark"));
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
              >
                <FiLogOut />
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--primary)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
