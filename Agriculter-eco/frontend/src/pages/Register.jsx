import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiUserPlus, FiArrowRight, FiBriefcase, FiShield, FiZap } from "react-icons/fi";
import useAuthStore from "../store/useAuthStore";
import { useSettings } from "../hooks";

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
    <div className="bg-slate-50 dark:bg-[#0a0f1d] min-h-screen text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 font-body transition-colors duration-300 relative py-24">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 dark:bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-8 text-left">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 text-2xl font-black font-heading tracking-wider">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <FiZap className="text-xl" />
            </div>
            <span>{storeName.toUpperCase()}</span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">Create an Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Join as a customer or verified supplier partner
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all"
                  placeholder="Amina Hassan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="email"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all"
                  placeholder="amina@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "USER", label: "Customer", icon: <FiUser /> },
                  { value: "SUPPLIER", label: "Supplier", icon: <FiBriefcase /> },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: item.value })}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      formData.role === item.value
                        ? "bg-blue-700 dark:bg-amber-500 text-white dark:text-slate-950 border-transparent shadow-md"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.role === "SUPPLIER" && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Business Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all"
                    placeholder="Grand Craft Ltd"
                    value={formData.supplierBusinessName}
                    onChange={(e) => setFormData({ ...formData, supplierBusinessName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    License / Registration Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-amber-400 transition-all"
                    placeholder="REG-2026-88"
                    value={formData.supplierLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, supplierLicenseNumber: e.target.value })}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-700/20 dark:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-400"
            >
              {isRegistering ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Already have an account?{" "}
              <Link to="/login" className="font-extrabold text-blue-700 dark:text-amber-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
