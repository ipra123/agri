import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FiRefreshCw, FiLoader, FiAlertCircle, FiCheckCircle, FiX, FiDollarSign, FiClock, FiEdit2, FiTrash2, FiAlertTriangle } from "react-icons/fi";

const AdminRefunds = () => {
  const queryClient = useQueryClient();

  const [confirmingRefund, setConfirmingRefund] = useState(null);
  const [confirmAmount, setConfirmAmount] = useState("");
  const [confirmRefundType, setConfirmRefundType] = useState("FULL");
  const [confirmReason, setConfirmReason] = useState("");

  const [editingRefund, setEditingRefund] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editRefundType, setEditRefundType] = useState("FULL");
  const [editReason, setEditReason] = useState("");

  const { data: refunds, isLoading, error } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: async () => {
      const { data } = await api.get("/refunds");
      return data;
    },
    refetchInterval: 15000,
  });

  const confirmRefundMutation = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/refunds/${id}/confirm`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-refunds"]);
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Dispute refund processed successfully!");
      setConfirmingRefund(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to process refund");
    },
  });

  const updateRefundMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/refunds/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-refunds"]);
      toast.success("Refund record updated!");
      setEditingRefund(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update refund");
    },
  });

  const deleteRefundMutation = useMutation({
    mutationFn: (id) => api.delete(`/refunds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-refunds"]);
      toast.success("Refund record deleted!");
    },
  });

  const handleOpenConfirmModal = (refund) => {
    setConfirmingRefund(refund);
    setConfirmAmount(refund.amount);
    setConfirmRefundType(refund.refundType || "FULL");
    setConfirmReason(refund.reason || "");
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!confirmingRefund) return;

    confirmRefundMutation.mutate({
      id: confirmingRefund.id,
      payload: {
        refundedNow: true,
        amount: parseFloat(confirmAmount),
        refundType: confirmRefundType,
        reason: confirmReason,
      },
    });
  };

  return (
    <div className="space-y-8 text-left pb-16 transition-colors duration-300">
      <div>
        <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">
          Disputes & Refund Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review farmer complaints (wrong delivery, uncertified products, damaged tools) and process refund payouts.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <FiLoader className="text-3xl animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Farmer Account</th>
                  <th className="p-4">Dispute Reason</th>
                  <th className="p-4">Refund Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {refunds?.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                      #{r.orderId?.slice(0, 10)}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {r.order?.user?.name || "Farmer"}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="line-clamp-1">{r.reason || "Dispute request"}</span>
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-amber-400">
                      ${r.amount}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        r.status === "REFUNDED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {r.status === "PENDING" ? (
                        <button
                          onClick={() => handleOpenConfirmModal(r)}
                          className="px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-md"
                        >
                          Process Refund
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-500 font-bold">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!refunds || refunds.length === 0) && (
              <div className="p-12 text-center text-slate-400 text-xs font-bold">
                No active dispute refund requests found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Refund Modal */}
      {confirmingRefund && (
        <div className="fixed inset-0 z-[999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white">
                Process Farmer Refund
              </h3>
              <button onClick={() => setConfirmingRefund(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Refund Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={confirmAmount}
                  onChange={(e) => setConfirmAmount(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Resolution Reason
                </label>
                <textarea
                  rows="3"
                  value={confirmReason}
                  onChange={(e) => setConfirmReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={confirmRefundMutation.isPending}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all"
              >
                {confirmRefundMutation.isPending ? "Confirming..." : "Approve & Confirm Refund"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;
