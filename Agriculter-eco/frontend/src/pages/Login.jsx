import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiShield, FiX, FiCheckCircle } from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import { useSettings } from "../hooks";
import brandLogo from "../assets/logo.png";
import heroImage from "../assets/hero.png";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuthStore();
  const { storeName } = useSettings();
  const navigate = useNavigate();

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate("/");
    } catch (error) {
      // handled in store
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsResetting(true);
    setResetSuccessMsg("");
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      setResetSuccessMsg(res.data.message || "A new 6-digit password has been sent to your email.");
      toast.success("New password sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen pt-0 relative">
      <div className="auth-shell__visual hero-panel m-4 hidden overflow-hidden lg:block">
        <img src={heroImage} alt="Marketplace preview" className="h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#07110b]/95 via-[#16331f]/65 to-[#07110b]/90" />
        <div className="absolute inset-0 p-10 text-white">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={brandLogo} alt={storeName} className="h-12 w-12 rounded-2xl object-cover" />
            <div className="text-left">
              <p className="text-xl font-black tracking-[0.22em]">{storeName || "AGRIECO"}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/70">market access</p>
            </div>
          </Link>

          <div className="mt-24 max-w-lg text-left">
            <span className="section-eyebrow border-white/20 bg-white/10 text-white">
              <FiShield />
              Secure sign in
            </span>
            <h1 className="mt-5 text-5xl font-black leading-tight">
              Sign in to manage orders, catalog, and supplier workspaces.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/76">
              Forgot your password? Reset it easily with an instant 6-digit password sent to your email.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-shell__form">
        <div className="auth-shell__panel auth-card">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={brandLogo} alt={storeName} className="h-12 w-12 rounded-2xl object-cover" />
              <div className="text-left">
                <p className="text-xl font-black tracking-[0.22em] text-[color:var(--text-main)]">{storeName || "AGRIECO"}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[color:var(--text-muted)]">market access</p>
              </div>
            </Link>
          </div>

          <div className="text-left">
            <span className="section-eyebrow">
              <FiShield />
              Sign in
            </span>
            <h2 className="mt-4 text-4xl font-black text-[color:var(--text-main)]">Welcome back</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">Use your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
            <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                Email address
              </span>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="email"
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)]"
                  placeholder="yourname@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="block">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  Password
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] font-bold text-[color:var(--primary)] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="password"
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-[color:var(--primary-hover)] disabled:opacity-70"
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
              {!isLoggingIn && <FiArrowRight />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
            Don't have an account?{" "}
            <Link to="/register" className="font-black text-[color:var(--primary)]">
              Create one now
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-black text-[color:var(--text-main)]">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSuccessMsg("");
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>

            {resetSuccessMsg ? (
              <div className="my-6 text-center">
                <FiCheckCircle className="mx-auto text-5xl text-emerald-600 mb-3" />
                <p className="font-bold text-gray-800 text-lg mb-2">Email Sent!</p>
                <p className="text-sm text-gray-600">{resetSuccessMsg}</p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSuccessMsg("");
                  }}
                  className="mt-6 w-full rounded-full bg-[color:var(--primary)] py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-[color:var(--primary-hover)]"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
                <p className="text-sm text-[color:var(--text-muted)]">
                  Enter your email address below. We will send a 6-digit random password directly to your email.
                </p>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Email address
                  </span>
                  <div className="relative">
                    <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                    <input
                      type="email"
                      className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none focus:border-[color:var(--primary)]"
                      placeholder="yourname@domain.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-[color:var(--primary-hover)] disabled:opacity-70"
                >
                  {isResetting ? "Sending Password..." : "Send New 6-Digit Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
