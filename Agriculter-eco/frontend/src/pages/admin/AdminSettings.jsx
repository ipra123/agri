import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FiSettings, FiMail, FiPhone, FiMapPin, FiDollarSign, FiSave, FiLoader, FiGlobe } from "react-icons/fi";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "AgriSmart Market",
    contactEmail: "support@agriconnect.market",
    contactPhone: "+252 61 5000000",
    address: "Bakara Agrovet District, Mogadishu, Somalia",
    currency: "USD"
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await api.get("/admin/settings");
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "AgriSmart Market",
        contactEmail: settings.contactEmail || "support@agriconnect.market",
        contactPhone: settings.contactPhone || "+252 61 5000000",
        address: settings.address || "Bakara Agrovet District, Mogadishu, Somalia",
        currency: settings.currency || "USD"
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.put("/admin/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-settings"]);
      toast.success("Marketplace configuration updated successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update settings");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl space-y-8 text-left pb-20 transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">
          Marketplace Settings & Identity
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage system identity, contact details, currency, and operational address.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl">
          <FiLoader className="text-3xl text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-amber-400">
                  <FiGlobe />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Marketplace Identity
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Official Platform Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-amber-400">
                  <FiMail />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Support & Contact Channels
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Headquarters / Operational Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-amber-400">
                  <FiDollarSign />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Currency Setting
                </h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Base Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-black text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="USD">USD ($) - US Dollar (Default Mobile Money)</option>
                  <option value="SOS">SOS (Sh.So) - Somali Shilling</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <FiSave className="text-base" />
              <span>{updateMutation.isPending ? "Saving Settings..." : "Save Marketplace Configuration"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
