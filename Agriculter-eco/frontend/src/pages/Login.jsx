import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiLogIn, FiArrowRight, FiZap } from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import { useSettings } from "../hooks";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuthStore();
  const { storeName } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/");
    } catch (error) {
      // handled in store
    }
  };

  return (
    <div className="min-h-screen w-full flex font-body bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Left panel — brand showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-blue-950 via-slate-900 to-amber-950 overflow-hidden items-center justify-center p-16 text-white">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md space-y-8 text-left">
          <Link to="/" className="inline-flex items-center gap-3 text-2xl font-black font-heading tracking-wider">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <FiZap className="text-xl" />
            </div>
            <span>{storeName.toUpperCase()}</span>
          </Link>

          <div className="space-y-4">
            <h2 className="text-4xl font-black font-heading leading-tight">
              Elegance, Luxury & Comfort in Every Detail.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Access your personal account to manage orders, browse premium artisanal catalogs, and enjoy dedicated priority support.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
            <div>
              <p className="text-3xl font-black text-amber-400">100%</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Authentic</p>
            </div>
            <div>
              <p className="text-3xl font-black text-amber-400">24/7</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Support</p>
            </div>
            <div>
              <p className="text-3xl font-black text-amber-400">Fast</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Express</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 text-left bg-white dark:bg-[#0f172a] p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-3 text-xl font-black tracking-wider text-slate-900 dark:text-white">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-bold">
                <FiZap />
              </div>
              <span>{storeName.toUpperCase()}</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="password"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-700/20 dark:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-400"
            >
              {isLoggingIn ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Don't have an account?{" "}
              <Link to="/register" className="font-extrabold text-blue-700 dark:text-amber-400 hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;