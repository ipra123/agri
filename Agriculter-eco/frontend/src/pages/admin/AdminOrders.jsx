import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiPlus,
  FiX,
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [orderItems, setOrderItems] = useState([{ productId: "", quantity: 1, price: 0 }]);

  // Refund confirmation modal states
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRefundedNow, setCancelRefundedNow] = useState(true);
  const [cancelAmount, setCancelAmount] = useState("");

  const [confirmRefundModal, setConfirmRefundModal] = useState(null);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders");
      return data;
    },
    refetchInterval: 30000,
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });

  // ---- Chart data (categories ordered + order rate over time) ----
  const categoryData = useMemo(() => {
    if (!orders?.length) return [];
    const map = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const cat =
          item.product?.category?.name ||
          item.product?.category ||
          item.product?.supplier?.supplierBusinessName ||
          "Other";
        const qty = item.quantity || 0;
        map[cat] = (map[cat] || 0) + qty;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const orderRateData = useMemo(() => {
    if (!orders?.length) return [];
    const map = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [orders]);

  const createOrderMutation = useMutation({
    mutationFn: (data) => api.post("/orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Manual order created successfully!");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create order");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order status updated!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    },
  });

  const resolveComplaintMutation = useMutation({
    mutationFn: ({ id, resolution }) => api.put(`/orders/${id}/resolve`, { resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Complaint resolved!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to resolve complaint");
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order deleted successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete order");
    },
  });

  const cancelOrderWithRefundMutation = useMutation({
    mutationFn: ({ id, payload }) => api.post(`/orders/${id}/cancel`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["admin-refunds"]);
      queryClient.invalidateQueries(["admin-finance-summary"]);
      toast.success("Order cancelled and refund logged successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    },
  });

  const confirmRefundMutation = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/refunds/${id}/confirm`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["admin-refunds"]);
      queryClient.invalidateQueries(["admin-finance-summary"]);
      toast.success("Refund confirmed!");
      setConfirmRefundModal(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to confirm refund");
    },
  });

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === "CANCELLED") {
      const ok = window.confirm(`Cancel order #${order.id.slice(0, 8).toUpperCase()}?`);
      if (!ok) return;

      cancelOrderWithRefundMutation.mutate({
        id: order.id,
        payload: {
          reason: "Cancelled by admin after confirmation",
          refundedNow: true,
          amount: order.totalAmount,
        },
      });
      return;
    }

    updateStatusMutation.mutate({ id: order.id, status: newStatus });
  };

  const resetForm = () => {
    setSelectedUserId("");
    setShippingAddress("");
    setComment("");
    setPaymentMethod("Cash");
    setOrderItems([{ productId: "", quantity: 1, price: 0 }]);
  };

  const handleAddProductRow = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveProductRow = (index) => {
    const updated = orderItems.filter((_, i) => i !== index);
    setOrderItems(updated);
  };

  const handleProductChange = (index, productId) => {
    const product = products?.find((p) => p.id === productId);
    const updated = [...orderItems];
    updated[index] = {
      productId,
      quantity: updated[index].quantity,
      price: product ? product.price : 0,
    };
    setOrderItems(updated);
  };

  const handleQuantityChange = (index, qty) => {
    const updated = [...orderItems];
    updated[index].quantity = parseInt(qty) || 1;
    setOrderItems(updated);
  };

  const handleManualOrderSubmit = (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a customer");
      return;
    }
    const validItems = orderItems.filter((item) => item.productId !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const totalAmount = validItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    createOrderMutation.mutate({
      userId: selectedUserId,
      shippingAddress,
      totalAmount,
      paymentMethod,
      last4Digits: "MANUAL",
      comment,
      items: validItems,
      isOffline: true,
    });
  };

  const pendingComplaints = orders?.filter((o) => o.complaintStatus === "PENDING")?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-main)]">Order Management</h1>
          <p className="text-[color:var(--text-muted)] mt-1">Track and manage customer purchases and complaints.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[color:var(--primary)] text-white px-6 py-3 rounded-xl font-bold hover:bg-[color:var(--primary-hover)] transition-all shadow-lg shadow-emerald-900/20"
          >
            <FiPlus /> Create Order
          </button>
          <button
            onClick={() => queryClient.invalidateQueries(["admin-orders"])}
            className="flex items-center gap-2 px-4 py-2.5 bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] hover:border-[color:var(--primary)] text-[color:var(--text-main)] rounded-xl transition-all"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Pending Complaints Alert */}
      {pendingComplaints > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="text-red-500 text-xl mt-1 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-semibold">{pendingComplaints} pending complaint(s) need attention</p>
            <p className="text-red-300/70 text-sm">Scroll down to view and resolve them</p>
          </div>
        </div>
      )}

      {/* ===== Analytics: Category breakdown + Order rate ===== */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiPieChart className="text-[color:var(--primary)] text-xl" />
              <h3 className="text-lg font-bold text-[color:var(--text-main)]">Orders by Category</h3>
              <span className="text-xs text-[color:var(--text-muted)] ml-auto">🥧 breakdown</span>
            </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[color:var(--text-muted)] text-sm py-16">No category data yet.</p>
            )}
          </div>

          <div className="bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiTrendingUp className="text-[color:var(--primary)] text-xl" />
              <h3 className="text-lg font-bold text-[color:var(--text-main)]">Order Rate</h3>
              <span className="text-xs text-[color:var(--text-muted)] ml-auto">📈 daily trend</span>
            </div>
            {orderRateData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={orderRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[color:var(--text-muted)] text-sm py-16">No order data yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FiLoader className="text-4xl text-[color:var(--primary)] animate-spin mb-4 mx-auto" />
            <p className="text-[color:var(--text-muted)]">Loading orders...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center text-red-500">
          <FiAlertCircle className="text-3xl mx-auto mb-3" />
          Failed to load orders. Please try again.
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[color:var(--text-main)]">
            All Orders {orders?.length > 0 && `(${orders.length})`}
          </h3>

          {orders?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-4"
                >
                  {/* Header: order id + amount */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-bold">Order ID</p>
                      <p className="font-mono font-bold text-[color:var(--text-main)] text-sm">#{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-bold">Total Amount</p>
                      <p className="text-[color:var(--text-main)] font-black text-lg">${parseFloat(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-bold">👤 Customer</p>
                    <p className="text-[color:var(--text-main)] font-semibold text-xs mt-0.5">{order.user?.name || "Unknown"}</p>
                    <p className="text-[color:var(--text-muted)] text-[11px]">{order.user?.email || "-"}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-bold mb-1">Order Status</p>
                    <select
                      className={`w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-lg px-2.5 py-1.5 text-[11px] font-bold outline-none cursor-pointer transition-all ${
                        order.status === "DELIVERED"
                          ? "text-emerald-500"
                          : order.status === "PENDING"
                          ? "text-blue-500"
                          : "text-[color:var(--text-muted)]"
                      }`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      disabled={updateStatusMutation.isPending || order.refund?.status === "REFUNDED"}
                    >
                      <option value="PENDING" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">PENDING</option>
                      <option value="SHIPPED" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">SHIPPED</option>
                      <option value="DELIVERED" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">DELIVERED</option>
                      <option value="CANCELLED" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">CANCELLED</option>
                    </select>
                    {order.status === "CANCELLED" && (
                      <div className="text-[10px] mt-1 font-semibold text-red-400">🚫 {order.refund?.status || "CANCELLED"}</div>
                    )}
                    {order.refund?.status === "REFUNDED" && (
                      <div className="text-[10px] text-emerald-400 mt-0.5 font-semibold">🔒 Locked (Refunded)</div>
                    )}
                  </div>

                  {/* Feedback */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-bold mb-1">Customer Feedback</p>
                    {order.comment ? (
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`inline-flex text-[9px] px-2 py-0.5 rounded-full font-bold uppercase w-fit ${
                            order.complaintStatus === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500 animate-pulse"
                          }`}
                        >
                          {order.complaintStatus === "RESOLVED" ? "✅ " : "⚠️ "}
                          {order.complaintStatus}
                        </span>
                        <p className="text-[11px] text-[color:var(--text-muted)] line-clamp-2 italic">"{order.comment}"</p>
                      </div>
                    ) : (
                      <span className="text-[color:var(--text-muted)] text-[11px]">None</span>
                    )}
                  </div>

                  {/* Manage: actions */}
                  <div className="pt-3 border-t border-[color:var(--border-color)] flex gap-1.5 items-center flex-wrap">
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all text-base"
                      title="View order"
                    >
                      🔍
                    </button>
                    <button
                      onClick={() => window.confirm("Delete this order?") && deleteOrderMutation.mutate(order.id)}
                      disabled={deleteOrderMutation.isPending}
                      className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-base disabled:opacity-50"
                      title="Delete order"
                    >
                      ❌
                    </button>

                    {order.status === "CANCELLED" && order.refund?.status === "PENDING" && (
                      <button
                        onClick={() => {
                          setConfirmRefundModal(order.refund);
                          setCancelAmount(order.refund.amount);
                          setCancelReason(order.refund.reason || "");
                          setCancelRefundedNow(true);
                        }}
                        className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                        title="Confirm money returned to customer"
                      >
                        <FiDollarSign size={12} /> Refunded?
                      </button>
                    )}

                    {order.comment && order.complaintStatus === "PENDING" && (
                      <>
                        <button
                          onClick={() => resolveComplaintMutation.mutate({ id: order.id, resolution: "REFUND" })}
                          disabled={resolveComplaintMutation.isPending}
                          className="bg-red-500/10 text-red-500 px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-red-500/20 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          {resolveComplaintMutation.isPending ? <FiLoader className="animate-spin" size={12} /> : "💸"}
                          Refund
                        </button>
                        <button
                          onClick={() => resolveComplaintMutation.mutate({ id: order.id, resolution: "REPLACE" })}
                          disabled={resolveComplaintMutation.isPending}
                          className="bg-[color:var(--primary)]/10 text-[color:var(--primary)] px-2.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[color:var(--primary)]/20 transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          {resolveComplaintMutation.isPending ? <FiLoader className="animate-spin" size={12} /> : <FiCheckCircle size={12} />}
                          Replace
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-2xl p-20 text-center text-[color:var(--text-muted)] italic shadow-sm">
              No orders found in the system.
            </div>
          )}
        </div>
      )}

      {/* Payment Details View Modal — horizontal layout */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-start z-[2000] p-6 overflow-y-auto">
          <div className="w-full max-w-6xl bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-[color:var(--text-main)]">📦 Order Details</h3>
                <p className="text-[color:var(--text-muted)] text-sm mt-1">#{viewingOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-[color:var(--surface-soft)] rounded-full text-[color:var(--text-muted)]">
                <FiX className="text-2xl" />
              </button>
            </div>

            {/* Horizontal 3-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Order Summary */}
              <div className="bg-[color:var(--surface-soft)] rounded-2xl p-5 border border-[color:var(--border-color)] space-y-3">
                <h4 className="text-[color:var(--primary)] font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  🧑‍💼 Summary
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[color:var(--text-muted)]">Customer:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Email:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">💰 Total:</span>
                    <p className="text-[color:var(--primary)] font-bold text-lg mt-0.5">${parseFloat(viewingOrder.totalAmount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">📌 Status:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.status}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">💳 Payment:</span>
                    <p className={`font-bold mt-0.5 ${["PAID", "FULLY_PAID", "DEPOSIT_PAID"].includes(viewingOrder.paymentStatus) ? "text-emerald-400" : "text-red-400"}`}>
                      {viewingOrder.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">🏠 Ship to:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.shippingAddress || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">🗓️ Placed:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items & Supplier Attribution */}
              <div className="bg-[color:var(--surface-soft)] rounded-2xl p-5 border border-[color:var(--border-color)] space-y-3">
                <h4 className="text-[color:var(--primary)] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                  🧾 Items & Suppliers
                </h4>
                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {viewingOrder.items.map((item, i) => (
                      <div key={i} className="p-3 bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-xl text-xs">
                        <p className="text-[color:var(--text-main)] font-bold text-sm">{item.product?.name || "Agricultural Item"}</p>
                        <p className="text-[color:var(--text-muted)] text-[11px] mt-0.5">
                          🚚 <span className="text-[color:var(--primary)] font-bold">{item.product?.supplier?.supplierBusinessName || item.product?.supplier?.name || "Direct Wholesale"}</span>
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[color:var(--text-main)] font-semibold">{item.quantity} × ${item.price}</span>
                          <span className="text-[color:var(--primary)] font-extrabold">${(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[color:var(--text-muted)] text-xs italic">No line items recorded for this order.</p>
                )}
              </div>

              {/* Payment History */}
              <div className="bg-[color:var(--surface-soft)] rounded-2xl p-5 border border-[color:var(--border-color)] space-y-3">
                <h4 className="text-[color:var(--primary)] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                  💳 Payment Transactions
                </h4>
                {viewingOrder.payments && viewingOrder.payments.length > 0 ? (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {viewingOrder.payments.map((p, index) => (
                      <div key={p.id || index} className="bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[color:var(--primary)] font-bold uppercase tracking-wider">{p.type} 💵</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${p.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {p.status === "APPROVED" ? "✅" : "⏳"} {p.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[color:var(--text-muted)]">
                          <div>
                            <span className="block">Amount:</span>
                            <span className="font-bold text-[color:var(--text-main)]">${parseFloat(p.amount || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="block">Method:</span>
                            <span className="font-bold text-[color:var(--text-main)]">{p.method} {p.manualType ? `(${p.manualType})` : ""}</span>
                          </div>
                          {p.phoneNumber && (
                            <div>
                              <span className="block">📱 Phone:</span>
                              <span className="font-semibold text-[color:var(--text-main)]">{p.phoneNumber}</span>
                            </div>
                          )}
                          <div>
                            <span className="block">🗓️ Date:</span>
                            <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[color:var(--text-muted)] text-sm">No payment records found for this order.</div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-8 py-3 bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] text-[color:var(--text-main)] font-bold rounded-xl hover:border-[color:var(--primary)] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-start z-[2000] p-10 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-[color:var(--text-main)]">Create Manual Order</h3>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 hover:bg-[color:var(--surface-soft)] rounded-full text-[color:var(--text-muted)]"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--text-muted)]">Customer</label>
                <select
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-5 py-3 text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--primary)] transition-all"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="" disabled className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-muted)]">Select Customer</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id} className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[color:var(--text-muted)]">Shipping Address</label>
                <textarea
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-5 py-3 text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] transition-all min-h-[80px]"
                  placeholder="E.g. 123 Luxury Lane, Milan"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[color:var(--text-muted)]">Payment Method</label>
                  <select
                    className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-5 py-3 text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--primary)] transition-all"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="EVC Plus" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">EVC Plus</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[color:var(--text-muted)]">Note / Comment</label>
                  <input
                    type="text"
                    className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-5 py-3 text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] transition-all"
                    placeholder="E.g. Call before delivery"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-[color:var(--text-muted)]">Order Items</label>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] px-3 py-1.5 rounded-lg hover:bg-[color:var(--primary)]/20 font-bold transition-all"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end bg-[color:var(--surface-soft)] p-3 rounded-xl border border-[color:var(--border-color)]">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-[color:var(--text-muted)] uppercase font-bold">Product</label>
                        <select
                          className="w-full bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-lg px-3 py-2 text-xs text-[color:var(--text-main)] focus:outline-none"
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          required
                        >
                          <option value="" disabled className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-muted)]">Select Product</option>
                          {products?.map((p) => (
                            <option key={p.id} value={p.id} className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
                              {p.name} (${p.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[10px] text-[color:var(--text-muted)] uppercase font-bold">Qty</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[color:var(--text-main)] focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          required
                        />
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[10px] text-[color:var(--text-muted)] uppercase font-bold">Price</label>
                        <div className="w-full bg-[color:var(--bg-card-solid)] py-2 px-3 rounded-lg text-xs text-[color:var(--text-main)] border border-[color:var(--border-color)] text-center font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProductRow(index)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all self-center"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[color:var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[color:var(--text-muted)] uppercase tracking-widest block">Total Order Value</span>
                  <span className="text-2xl font-bold text-[color:var(--primary)]">
                    ${orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="bg-[color:var(--primary)] text-white font-bold px-8 py-3 rounded-xl hover:bg-[color:var(--primary-hover)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <FiLoader className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Place Manual Order"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Confirm Money Returned Modal ===== */}
      {confirmRefundModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[3000] p-6">
          <div className="w-full max-w-md bg-[color:var(--bg-card-solid)] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-[color:var(--text-main)]">💵 Money Returned</h3>
                <p className="text-[color:var(--text-muted)] text-xs mt-0.5">Confirm customer refund payment receipt.</p>
              </div>
              <button onClick={() => setConfirmRefundModal(null)} className="p-2 hover:bg-[color:var(--surface-soft)] rounded-full text-[color:var(--text-muted)]">
                <FiX className="text-xl" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(cancelAmount);
                if (cancelRefundedNow && (isNaN(amt) || amt <= 0)) {
                  toast.error("Lacagta la celinayo waa in ay ka badnaataa eber ($0) mar haddii la xaqiijiyay in lacagtii la celiyay.");
                  return;
                }
                confirmRefundMutation.mutate({
                  id: confirmRefundModal.id,
                  payload: {
                    refundedNow: cancelRefundedNow,
                    amount: amt,
                    reason: cancelReason,
                  },
                });
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Has money been returned to customer?</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-[color:var(--text-main)] cursor-pointer">
                    <input
                      type="radio"
                      name="confirmRefundedNow"
                      checked={cancelRefundedNow === true}
                      onChange={() => setCancelRefundedNow(true)}
                      className="accent-[color:var(--primary)]"
                    />
                    ✅ Yes (Confirm REFUNDED)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[color:var(--text-main)] cursor-pointer">
                    <input
                      type="radio"
                      name="confirmRefundedNow"
                      checked={cancelRefundedNow === false}
                      onChange={() => setCancelRefundedNow(false)}
                      className="accent-[color:var(--primary)]"
                    />
                    ⏳ No (Keep PENDING)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cancelAmount}
                  onChange={(e) => setCancelAmount(e.target.value)}
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-4 py-3 text-sm text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--primary)] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-4 py-3 text-sm text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--primary)] transition-all min-h-[70px]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConfirmRefundModal(null)}
                  className="flex-1 py-3 bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] text-[color:var(--text-muted)] font-bold rounded-xl hover:text-[color:var(--text-main)] transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmRefundMutation.isPending}
                  className="flex-1 py-3 bg-[color:var(--primary)] text-white font-bold rounded-xl hover:bg-[color:var(--primary-hover)] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {confirmRefundMutation.isPending ? <FiLoader className="animate-spin" /> : "Save Refund Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;