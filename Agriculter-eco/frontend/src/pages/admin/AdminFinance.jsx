import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/api";
import { FiDollarSign, FiCreditCard, FiArrowUpRight, FiArrowDownLeft, FiFilter, FiDownload, FiEye, FiX } from "react-icons/fi";

const AdminFinance = () => {
  const [viewingTx, setViewingTx] = useState(null);
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data } = await api.get("/admin/transactions");
      return data;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["admin-finance-summary"],
    queryFn: async () => {
      const { data } = await api.get("/finance/summary");
      return data;
    },
    refetchInterval: 15000,
  });

  const grossRevenue = summary?.grossRevenue ?? 0;
  const totalRefunded = summary?.totalRefunded ?? 0;
  const netRevenue = summary?.netRevenue ?? (grossRevenue - totalRefunded);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Financial Reports</h1>
          <p className="text-slate-400">Track your store's financial performance and transactions.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all text-sm border border-white/5">
            <FiFilter /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#16a34a] text-black font-bold rounded-lg hover:opacity-90 transition-all text-sm shadow-lg shadow-[#16a34a]/20">
            <FiDownload /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gross Revenue */}
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-900/20 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              <FiCreditCard className="text-2xl" />
            </div>
            <p className="text-slate-400 font-medium">Gross Revenue</p>
          </div>
          <h3 className="text-3xl font-bold text-white">${grossRevenue.toFixed(2)}</h3>
          <p className="text-xs text-slate-500 mt-4">Orders with paid deposit/full payment</p>
        </div>

        {/* Total Refunded */}
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-900/20 border border-white/5 p-8 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
              <FiArrowDownLeft className="text-2xl" />
            </div>
            <p className="text-slate-400 font-medium">Total Refunded</p>
          </div>
          <h3 className="text-3xl font-bold text-red-400">${totalRefunded.toFixed(2)}</h3>
          <p className="text-xs text-slate-500 mt-4">Confirmed REFUNDED amounts</p>
        </div>

        {/* Net Revenue */}
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/40 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#16a34a]/10 rounded-full blur-2xl group-hover:bg-[#16a34a]/20 transition-all"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#16a34a]/20 rounded-2xl text-[#16a34a]">
              <FiDollarSign className="text-2xl" />
            </div>
            <p className="text-slate-400 font-medium">Net Revenue</p>
          </div>
          <h3 className="text-4xl font-bold text-white">${netRevenue.toFixed(2)}</h3>
          <div className="mt-4 flex items-center gap-1 text-green-400 text-sm font-semibold">
            <FiArrowUpRight /> Gross minus confirmed refunds
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-sm overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm font-semibold border-b border-white/5">
                <th className="px-8 py-5">Transaction Details</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions?.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-white font-medium group-hover:text-[#16a34a] transition-colors">{t.description}</p>
                    <p className="text-xs text-slate-500 mt-1">ID: #{t.id.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.type === 'PAYMENT' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className={`font-bold ${t.type === 'REFUND' ? 'text-red-400' : 'text-white'}`}>
                      {t.type === 'REFUND' ? '-' : '+'}${t.amount.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-sm text-slate-300">{t.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-400 text-sm">
                    {new Date(t.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => setViewingTx(t)}
                      className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-all"
                      title="View Details"
                    >
                      <FiEye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {transactions?.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <p className="text-slate-500 italic">No transactions recorded yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {viewingTx && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start z-[2000] p-10 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Transaction Details</h3>
                <p className="text-slate-500 text-sm mt-1">ID: #{viewingTx.id.toUpperCase()}</p>
              </div>
              <button onClick={() => setViewingTx(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-3">
                <h4 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest mb-4">Transaction Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Description:</span>
                    <p className="text-white font-semibold mt-0.5">{viewingTx.description || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Type:</span>
                    <p className={`font-bold mt-0.5 ${viewingTx.type === 'PAYMENT' ? 'text-green-400' : 'text-red-400'}`}>{viewingTx.type}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Amount:</span>
                    <p className="text-white font-bold text-lg mt-0.5">${viewingTx.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <p className="text-white font-semibold mt-0.5">{viewingTx.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Created At:</span>
                    <p className="text-white font-semibold mt-0.5">{new Date(viewingTx.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Connected Order Summary */}
              {viewingTx.order ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-3">
                    <h4 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest mb-4">Associated Order Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Order ID:</span>
                        <p className="text-white font-semibold mt-0.5">#{viewingTx.order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Customer Name:</span>
                        <p className="text-white font-semibold mt-0.5">{viewingTx.order.user?.name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Customer Email:</span>
                        <p className="text-white font-semibold mt-0.5">{viewingTx.order.user?.email || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Payment Method:</span>
                        <p className="text-white font-semibold mt-0.5">{viewingTx.order.paymentMethod || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500">Shipping Address:</span>
                        <p className="text-white font-semibold mt-0.5">{viewingTx.order.shippingAddress || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Connected Order Items */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <h4 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {viewingTx.order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-2 text-sm text-slate-300">
                          <div>
                            <span className="text-white font-semibold">{item.product?.name || "Unknown Product"}</span>
                            <span className="text-xs text-slate-500 block">Qty: {item.quantity} x ${item.price.toFixed(2)}</span>
                          </div>
                          <span className="text-white font-bold">${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Payments Info */}
                  {viewingTx.order.payments && viewingTx.order.payments.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                      <h4 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest">Order Payments</h4>
                      <div className="space-y-3">
                        {viewingTx.order.payments.map((p, index) => (
                          <div key={p.id || index} className="bg-black/40 border border-white/5 rounded-xl p-4 text-xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[#16a34a] font-bold uppercase tracking-wider">{p.type} Payment</span>
                              <span className={`px-2 py-0.5 rounded font-bold uppercase ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {p.status}
                              </span>
                            </div>
                            <div className="text-slate-300">
                              <p>Amount: <strong>${p.amount.toFixed(2)}</strong> | Method: {p.method} {p.manualType ? `(${p.manualType})` : ""}</p>
                              {p.phoneNumber && <p className="text-slate-400">Phone: {p.phoneNumber}</p>}
                            </div>
                            {p.paymentInfo && (
                              <pre className="bg-black/60 border border-white/5 rounded-lg p-2 font-mono text-[10px] text-green-400 overflow-x-auto max-h-32">
                                {JSON.stringify(p.paymentInfo, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-center">
                  <p className="text-slate-500 text-sm">No connected order info available for this transaction.</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setViewingTx(null)}
                className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;

