import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FiTrash2, FiUserPlus, FiX, FiLoader, FiShield, FiUser, FiEdit2, FiCheckCircle, FiClock, FiXCircle, FiBriefcase } from "react-icons/fi";

const AdminCustomers = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  return (
    <div className="space-y-8 text-left pb-16 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-[color:var(--text-main)]">
            User Accounts & Supplier KYC
          </h1>
          <p className="text-[color:var(--text-muted)] text-sm mt-1">
            Manage farmer accounts, agrovet supplier approvals, and administrator roles.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3.5 bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center gap-2"
        >
          <FiUserPlus className="text-base" /> Add New Account
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-[color:var(--text-muted)]">
          <FiLoader className="text-3xl animate-spin text-[color:var(--primary)]" />
        </div>
      ) : (
        <div className="bg-[color:var(--bg-card-solid)] rounded-3xl border border-[color:var(--border-color)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[color:var(--surface-soft)] uppercase tracking-widest text-[10px] text-[color:var(--primary)] font-extrabold border-b border-[color:var(--border-color)]">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Business & License</th>
                  <th className="p-4">KYC Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border-color)] font-bold">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-[color:var(--surface-soft)] transition-all">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] flex items-center justify-center text-[color:var(--primary)] font-black text-sm">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-[color:var(--text-main)]">{u.name}</p>
                          <p className="text-[10px] text-[color:var(--text-muted)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.role === "ADMIN"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : u.role === "SUPPLIER"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-[color:var(--text-muted)]">
                      {u.role === "SUPPLIER" ? (
                        <div>
                          <p className="text-xs font-black text-[color:var(--text-main)]">{u.supplierBusinessName || u.businessName || "Agrovet Partner"}</p>
                          <p className="text-[10px] text-[color:var(--text-muted)]">Reg: {u.supplierLicenseNumber || "N/A"}</p>
                        </div>
                      ) : (
                        <span className="text-[color:var(--text-muted)] text-[11px]">Individual Farmer</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.role === "SUPPLIER" ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
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
                              className="px-2 py-1 bg-[color:var(--primary)] text-white text-[9px] font-black rounded-lg uppercase"
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 rounded-xl text-blue-400 hover:bg-[color:var(--surface-soft)]"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(u.id)}
                          className="p-2 rounded-xl text-red-400 hover:bg-[color:var(--surface-soft)]"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[color:var(--bg-card-solid)] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[color:var(--border-color)] shadow-2xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-4">
              <h3 className="text-lg font-black font-heading text-[color:var(--text-main)]">
                {editingUser ? "Edit Account Details" : "Create New User Account"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Amina Hassan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4 py-3 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="user@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4 py-3 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none"
                />
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4 py-3 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  User Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4 py-3 text-xs font-bold text-[color:var(--text-main)] focus:outline-none"
                >
                  <option value="FARMER" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Farmer (Buyer)</option>
                  <option value="SUPPLIER" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Agrovet Supplier (Seller)</option>
                  <option value="ADMIN" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">System Administrator</option>
                </select>
              </div>

              {formData.role === "SUPPLIER" && (
                <div className="space-y-3 pt-2 border-t border-[color:var(--border-color)]">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                      Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="AgriSeed Solutions Ltd"
                      value={formData.supplierBusinessName}
                      onChange={(e) => setFormData({ ...formData, supplierBusinessName: e.target.value })}
                      className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4 py-3 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                      KYC Verification Status
                    </label>
                    <select
                      value={formData.verificationStatus}
                      onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                      className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-2xl px-4 py-3 text-xs font-bold text-[color:var(--text-main)] focus:outline-none"
                    >
                      <option value="PENDING" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Pending Review</option>
                      <option value="APPROVED" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Approved / Verified</option>
                      <option value="REJECTED" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">Rejected</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3.5 rounded-2xl bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] text-white font-black text-xs uppercase tracking-widest shadow-md transition-all"
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
