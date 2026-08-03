import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight, FiShield } from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import { useSettings } from "../hooks";
import brandLogo from "../assets/logo.png";
import heroImage from "../assets/hero.png";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    supplierBusinessName: "",
    supplierLicenseNumber: "",
  });
  const { register, isRegistering } = useAuthStore();
  const { storeName } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/");
    } catch (error) {
      // handled in store
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
              Registration now matches the rest of the platform with calm earth tones, strong spacing, and premium surfaces.
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
            <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Full name</span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="text"
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)]"
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
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)]"
                  placeholder="amina@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Password</span>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="password"
                  className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </label>

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
              <div className="space-y-4 rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Business name</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-4 py-3 text-sm text-[color:var(--text-main)] outline-none"
                    placeholder="Grand Craft Ltd"
                    value={formData.supplierBusinessName}
                    onChange={(e) => setFormData({ ...formData, supplierBusinessName: e.target.value })}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">License number</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-4 py-3 text-sm text-[color:var(--text-main)] outline-none"
                    placeholder="REG-2026-88"
                    value={formData.supplierLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, supplierLicenseNumber: e.target.value })}
                  />
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isRegistering}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-[color:var(--primary-hover)] disabled:opacity-70"
            >
              {isRegistering ? "Creating account..." : "Create account"}
              {!isRegistering && <FiArrowRight />}
            </button>
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
