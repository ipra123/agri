import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight, FiShield, FiKey } from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import { useSettings } from "../hooks";
import brandLogo from "../assets/logo.png";
import heroImage from "../assets/hero.png";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    supplierBusinessName: "",
    supplierLicenseNumber: "",
  });
  const [verificationDocument, setVerificationDocument] = useState(null);
  
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const { register, isRegistering } = useAuthStore();
  const { storeName } = useSettings();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.password) {
      toast.error("Please fill in your name, email, and password first.");
      return;
    }
    if (formData.role === "SUPPLIER" && !formData.supplierBusinessName) {
      toast.error("Business name is required for suppliers.");
      return;
    }
    if (formData.role === "SUPPLIER" && !verificationDocument) {
      toast.error("Supplier verification document is required.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { email: formData.email });
      setOtpSent(true);
      toast.success("OTP verification code sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit OTP code sent to your email.");
      return;
    }
    if (formData.role === "SUPPLIER" && !verificationDocument) {
      toast.error("Please upload a supplier verification document.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: otpCode.trim(),
      });

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim());
      payload.append("password", formData.password);
      payload.append("role", formData.role);
      payload.append("supplierBusinessName", formData.supplierBusinessName.trim());
      payload.append("supplierLicenseNumber", formData.supplierLicenseNumber.trim());
      if (verificationDocument) {
        payload.append("verificationDocument", verificationDocument);
      }

      await register(payload);
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification or registration failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen pt-0">
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
              Create account
            </span>
            <h1 className="mt-5 text-5xl font-black leading-tight">
              Join as a customer or verified supplier partner.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/76">
              Registration requires email OTP verification for enhanced security.
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
              Sign up
            </span>
            <h2 className="mt-4 text-4xl font-black text-[color:var(--text-main)]">Create an account</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">Choose a customer or supplier profile.</p>
          </div>

          <form onSubmit={otpSent ? handleVerifyAndRegister : handleSendOtp} className="mt-8 space-y-5 text-left">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Full name</span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="text"
                  disabled={otpSent}
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)] disabled:bg-gray-100"
                  placeholder="Amina Hassan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </label>

              <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Email address</span>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="email"
                  disabled={otpSent}
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)] disabled:bg-gray-100"
                  placeholder="amina@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </label>

              <label className="block sm:col-span-2">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Password</span>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="password"
                  disabled={otpSent}
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)] disabled:bg-gray-100"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </label>
            </div>

            <div className="space-y-2">
              <span className="mb-1 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Account type</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "USER", label: "Customer", icon: FiUser },
                  { value: "SUPPLIER", label: "Supplier", icon: FiBriefcase },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      disabled={otpSent}
                      onClick={() => setFormData({ ...formData, role: item.value })}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition ${
                        formData.role === item.value
                          ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-white"
                          : "border-[color:var(--border-color)] bg-white text-[color:var(--text-main)]"
                      }`}
                    >
                      <Icon />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.role === "SUPPLIER" && (
              <div className="space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">Business name</span>
                    <input
                      type="text"
                      disabled={otpSent}
                      className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-[color:var(--text-main)] outline-none disabled:bg-gray-100 focus:border-[color:var(--primary)]"
                      placeholder="Grand Craft Ltd"
                      value={formData.supplierBusinessName}
                      onChange={(e) => setFormData({ ...formData, supplierBusinessName: e.target.value })}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">License number</span>
                    <input
                      type="text"
                      disabled={otpSent}
                      className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-[color:var(--text-main)] outline-none disabled:bg-gray-100 focus:border-[color:var(--primary)]"
                      placeholder="REG-2026-88"
                      value={formData.supplierLicenseNumber}
                      onChange={(e) => setFormData({ ...formData, supplierLicenseNumber: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">Verification document image</span>
                  <input
                    type="file"
                    disabled={otpSent}
                    accept="image/*"
                    className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-[color:var(--text-main)] outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-[color:var(--primary)] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.16em] file:text-white disabled:bg-gray-100"
                    onChange={(e) => setVerificationDocument(e.target.files?.[0] || null)}
                    required
                  />
                  <p className="mt-2 text-[11px] text-emerald-800/70">
                    Upload your supplier registration or verification document as an image.
                  </p>
                </label>
              </div>
            )}

            {otpSent && (
              <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-4 text-left">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">
                    Enter 6-Digit Email OTP Code
                  </span>
                  <div className="relative">
                    <FiKey className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" />
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full rounded-2xl border border-emerald-300 bg-white px-12 py-3 text-lg font-bold tracking-widest text-emerald-900 outline-none focus:border-emerald-600"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </div>
                </label>
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-700">
                  <span>Code sent to {formData.email}</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="font-bold underline hover:text-emerald-900"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {!otpSent ? (
              <button
                type="submit"
                disabled={isSendingOtp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-[color:var(--primary-hover)] disabled:opacity-70"
              >
                {isSendingOtp ? "Sending OTP Code..." : "Send Email Verification OTP"}
                {!isSendingOtp && <FiArrowRight />}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isVerifyingOtp || isRegistering}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-emerald-800 disabled:opacity-70"
              >
                {isVerifyingOtp || isRegistering ? "Verifying & Creating Account..." : "Verify OTP & Create Account"}
                <FiArrowRight />
              </button>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="font-black text-[color:var(--primary)]">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
