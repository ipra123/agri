import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import api from "../../lib/api";
import { resolveMediaUrl } from "../../lib/media";
import toast from "react-hot-toast";
import {
  FiTrash2,
  FiUserPlus,
  FiX,
  FiLoader,
  FiShield,
  FiUser,
  FiEdit2,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiBriefcase,
  FiFileText,
  FiDownload,
  FiExternalLink,
  FiSearch,
  FiFilter,
  FiSlash,
  FiPenTool,
} from "react-icons/fi";

const ROLE_FILTERS = ["ALL", "FARMER", "SUPPLIER", "ADMIN"];
const KYC_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const AdminCustomers = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FARMER",
    supplierBusinessName: "",
    supplierLicenseNumber: "",
    verificationStatus: "PENDING",
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/auth/register", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User account created!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "FARMER", supplierBusinessName: "", supplierLicenseNumber: "", verificationStatus: "PENDING" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create user"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User account updated!");
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User account deleted!");
    },
  });

  const updateKycMutation = useMutation({
    mutationFn: ({ id, verificationStatus }) => api.put(`/admin/users/${id}`, { verificationStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("Supplier KYC status updated!");
    },
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "FARMER", supplierBusinessName: "", supplierLicenseNumber: "", verificationStatus: "PENDING" });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      supplierBusinessName: user.supplierBusinessName || "",
      supplierLicenseNumber: user.supplierLicenseNumber || "",
      licenseDocumentUrl: user.licenseDocumentUrl || "",
      verificationStatus: user.verificationStatus || "PENDING",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const term = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const matchesTerm =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.supplierBusinessName?.toLowerCase().includes(term);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesKyc =
        kycFilter === "ALL" ||
        (u.role === "SUPPLIER" && (u.verificationStatus || "PENDING") === kycFilter);
      return matchesTerm && matchesRole && matchesKyc;
    });
  }, [users, searchTerm, roleFilter, kycFilter]);

  return (
    <div className="space-y-7 text-left pb-16 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-7">
        <div>
          <h1 className="text-2xl font-black font-heading text-[color:var(--text-main)]">
            User Accounts & Supplier KYC
          </h1>
          <p className="text-[color:var(--text-muted)] text-[13px] mt-1.5">
            Manage farmer accounts, agrovet supplier approvals, and administrator roles.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3.5 bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] active:scale-95 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all flex items-center gap-2.5 flex-shrink-0"
        >
          <FiUserPlus className="text-base" /> Add New Account
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-5 flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or business..."
            className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)] flex-shrink-0 pr-1">
            <FiFilter size={12} /> Role
          </span>
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                roleFilter === r
                  ? "bg-[color:var(--primary)] text-white shadow-md"
                  : "bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] border border-[color:var(--border-color)] hover:text-[color:var(--text-main)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-black uppercase tracking-widest text-[color:var(--text-muted)] flex-shrink-0 pr-1">
            KYC
          </span>
          {KYC_FILTERS.map((k) => (
            <button
              key={k}
              onClick={() => setKycFilter(k)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                kycFilter === k
                  ? "bg-[color:var(--primary)] text-white shadow-md"
                  : "bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] border border-[color:var(--border-color)] hover:text-[color:var(--text-main)]"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-72 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] text-[color:var(--text-muted)]">
          <FiLoader className="text-3xl animate-spin text-[color:var(--primary)]" />
        </div>
      ) : (
        <div className="bg-[color:var(--bg-card-solid)] rounded-[0px] border border-[color:var(--border-color)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[color:var(--surface-soft)] uppercase tracking-[0.18em] text-[10px] text-[color:var(--primary)] font-extrabold border-b border-[color:var(--border-color)]">
                <tr>
                  <th className="p-5">Actions</th>
                  <th className="p-5">User Details</th>
                  <th className="p-5">Role</th>
                  <th className="p-5">Business & License</th>
                  <th className="p-5">KYC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border-color)] font-bold">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-[color:var(--text-muted)] text-xs">
                      No accounts match your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[color:var(--surface-soft)] transition-all">
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit account"
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all active:scale-90"
                          >
                            <FiPenTool size={15} />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(u.id)}
                            title="Delete account"
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                          >
                            <FiSlash size={15} />
                          </button>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] flex items-center justify-center text-[color:var(--primary)] font-black text-sm flex-shrink-0">
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-[color:var(--text-main)]">{u.name}</p>
                            <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                          u.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : u.role === "SUPPLIER"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-5 text-[color:var(--text-muted)]">
                        {u.role === "SUPPLIER" ? (
                          <div>
                            <p className="text-xs font-black text-[color:var(--text-main)]">{u.supplierBusinessName || u.businessName || "Agrovet Partner"}</p>
                            <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">Reg: {u.supplierLicenseNumber || "N/A"}</p>
                          </div>
                        ) : (
                          <span className="text-[color:var(--text-muted)] text-[11px]">Individual Farmer</span>
                        )}
                      </td>
                      <td className="p-5">
                        {u.role === "SUPPLIER" ? (
                          <div className="flex items-center gap-2.5">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                              u.verificationStatus === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : u.verificationStatus === "REJECTED"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {u.verificationStatus || "PENDING"}
                            </span>
                            {u.verificationStatus !== "APPROVED" && (
                              <button
                                onClick={() => updateKycMutation.mutate({ id: u.id, verificationStatus: "APPROVED" })}
                                className="px-3 py-1.5 bg-[color:var(--primary)] text-white text-[9px] font-black rounded-xl uppercase active:scale-95 transition-transform"
                                title="Approve Supplier"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[color:var(--text-muted)] text-[10px]">Verified Farmer</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create User Modal — horizontal layout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[color:var(--bg-card-solid)] rounded-[32px] p-7 sm:p-9 max-w-2xl w-full border border-[color:var(--border-color)] shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-5">
              <h3 className="text-lg font-black font-heading text-[color:var(--text-main)]">
                {editingUser ? "Edit Account Details" : "Create New User Account"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-2xl text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[color:var(--surface-soft)] transition-colors">
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Amina Hassan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4.5 py-3.5 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="user@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4.5 py-3.5 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
                  />
                </div>

                {!editingUser && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4.5 py-3.5 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                    User Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4.5 py-3.5 text-xs font-bold text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
                  >
                    <option value="FARMER" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Farmer (Buyer)</option>
                    <option value="SUPPLIER" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Agrovet Supplier (Seller)</option>
                    <option value="ADMIN" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">System Administrator</option>
                  </select>
                </div>
              </div>

              {formData.role === "SUPPLIER" && (
                <div className="space-y-4 pt-4 border-t border-[color:var(--border-color)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                        Business Name
                      </label>
                      <input
                        type="text"
                        placeholder="AgriSeed Solutions Ltd"
                        value={formData.supplierBusinessName}
                        onChange={(e) => setFormData({ ...formData, supplierBusinessName: e.target.value })}
                        className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4.5 py-3.5 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                        KYC Verification Status
                      </label>
                      <select
                        value={formData.verificationStatus}
                        onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                        className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4.5 py-3.5 text-xs font-bold text-[color:var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30"
                      >
                        <option value="PENDING" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Pending Review</option>
                        <option value="APPROVED" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Approved / Verified</option>
                        <option value="REJECTED" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--text-muted)] flex items-center gap-2">
                      <FiFileText size={12} /> Supplier Verification Document
                    </label>
                    {formData.licenseDocumentUrl ? (
                      <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-5 space-y-3.5">
                        <div className="text-xs text-[color:var(--text-muted)] break-all">
                          {formData.licenseDocumentUrl}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          <a
                            href={resolveMediaUrl(formData.licenseDocumentUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--primary)] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white active:scale-95 transition-transform"
                          >
                            <FiExternalLink size={12} /> Open
                          </a>
                          <a
                            href={resolveMediaUrl(formData.licenseDocumentUrl)}
                            download
                            className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border-color)] bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[color:var(--text-main)] active:scale-95 transition-transform"
                          >
                            <FiDownload size={12} /> Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-5 py-4 text-[11px] text-[color:var(--text-muted)]">
                        No verification document uploaded yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-4 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] active:scale-[0.98] text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all"
              >
                {editingUser ? "Update User Account" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;