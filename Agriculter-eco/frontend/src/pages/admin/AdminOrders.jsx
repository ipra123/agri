import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FiRefreshCw, FiCheckCircle, FiLoader, FiAlertCircle, FiTrash2, FiPlus, FiX, FiEye, FiDollarSign } from "react-icons/fi";

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [comment, setComment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [orderItems, setOrderItems] = useState([{ productId: "", quantity: 1, price: 0 }]);

  // Cancel Order & Refund Modal States
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelRefundedNow, setCancelRefundedNow] = useState(true);
  const [cancelAmount, setCancelAmount] = useState("");
  const [cancelRefundType, setCancelRefundType] = useState("FULL");

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
    }
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    }
  });

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
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order status updated!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    }
  });

  const resolveComplaintMutation = useMutation({
    mutationFn: ({ id, resolution }) => api.put(`/orders/${id}/resolve`, { resolution }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Complaint resolved!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to resolve complaint");
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      toast.success("Order deleted successfully!");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete order");
    }
  });

  const cancelOrderWithRefundMutation = useMutation({
    mutationFn: ({ id, payload }) => api.post(`/orders/${id}/cancel`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["admin-refunds"]);
      queryClient.invalidateQueries(["admin-finance-summary"]);
      toast.success("Order cancelled and refund logged successfully!");
      setCancelModalOrder(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    }
  });

  const confirmRefundMutation = useMutation({
    mutationFn: ({ id, payload }) => api.patch(`/refunds/${id}/confirm`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-orders"]);
      queryClient.invalidateQueries(["admin-refunds"]);
      queryClient.invalidateQueries(["admin-[#finance-summary]"]);
      queryClient.invalidateQueries(["admin-finance-summary"]);
      toast.success("Refund confirmed!");
      setConfirmRefundModal(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to confirm refund");
    }
  });

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === "CANCELLED") {
      setCancelModalOrder(order);
      setCancelReason("");
      setCancelRefundedNow(true);
      setCancelAmount(order.totalAmount);
      setCancelRefundType("FULL");
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
      isOffline: true
    });
  };

  const pendingComplaints = orders?.filter(o => o.complaintStatus === 'PENDING')?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Order Management</h1>
          <p className="text-slate-400 mt-1">Track and manage customer purchases and complaints.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#16a34a] text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#16a34a]/20"
          >
            <FiPlus /> Create Order
          </button>
          <button
            onClick={() => queryClient.invalidateQueries(["admin-orders"])}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FiLoader className="text-4xl text-[#16a34a] animate-spin mb-4 mx-auto" />
            <p className="text-slate-400">Loading orders...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center text-red-500">
          <FiAlertCircle className="text-3xl mx-auto mb-3" />
          Failed to load orders. Please try again.
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">
              All Orders {orders?.length > 0 && `(${orders.length})`}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="p-6 text-[#16a34a] uppercase text-xs font-bold tracking-wider">Order ID</th>
                  <th className="p-6 text-[#16a34a] uppercase text-xs font-bold tracking-wider">Customer</th>
                  <th className="p-6 text-[#16a34a] uppercase text-xs font-bold tracking-wider">Amount</th>
                  <th className="p-6 text-[#16a34a] uppercase text-xs font-bold tracking-wider">Status</th>
                  <th className="p-6 text-[#16a34a] uppercase text-xs font-bold tracking-wider">Complaints</th>
                  <th className="p-6 text-[#16a34a] uppercase text-xs font-bold tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders?.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-all">
                      <td className="p-6 font-mono text-slate-400 text-sm">#{order.id.slice(0, 8)}</td>
                      <td className="p-6">
                        <div className="text-white font-semibold text-sm">{order.user?.name || "Unknown"}</div>
                        <div className="text-slate-500 text-xs">{order.user?.email || "-"}</div>
                      </td>
                      <td className="p-6 text-white font-bold">${parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                      <td className="p-6">
                        <select
                          className={`bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold focus:ring-1 ring-[#16a34a] outline-none cursor-pointer transition-all ${order.status === 'DELIVERED' ? 'text-emerald-500' :
                            order.status === 'PENDING' ? 'text-blue-500' : 'text-slate-400'
                            }`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          disabled={updateStatusMutation.isPending || order.refund?.status === "REFUNDED"}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        {order.refund?.status === "REFUNDED" && (
                          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">Locked (Refunded)</div>
                        )}
                      </td>
                      <td className="p-6">
                        {order.comment ? (
                          <div className="flex flex-col gap-2">
                            <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold uppercase w-fit ${order.complaintStatus === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'
                              }`}>
                              {order.complaintStatus}
                            </span>
                            <p className="text-xs text-slate-500 line-clamp-2 italic max-w-[200px]">"{order.comment}"</p>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">None</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2 items-center flex-wrap">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-all"
                            title="View Payment Details"
                          >
                            <FiEye size={12} /> View
                          </button>

                          {/* Conditional Money Returned button */}
                          {order.status === "CANCELLED" && order.refund?.status === "PENDING" && (
                            <button
                              onClick={() => {
                                setConfirmRefundModal(order.refund);
                                setCancelAmount(order.refund.amount);
                                setCancelRefundType(order.refund.refundType || "FULL");
                                setCancelReason(order.refund.reason || "");
                                setCancelRefundedNow(true);
                              }}
                              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                              title="Confirm Money Returned to Customer"
                            >
                              <FiDollarSign size={12} /> Money Returned
                            </button>
                          )}
                          {order.comment && order.complaintStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => resolveComplaintMutation.mutate({ id: order.id, resolution: 'REFUND' })}
                                disabled={resolveComplaintMutation.isPending}
                                className="bg-red-500/10 text-red-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                {resolveComplaintMutation.isPending ? <FiLoader className="animate-spin" size={12} /> : <FiRefreshCw size={12} />}
                                Refund
                              </button>
                              <button
                                onClick={() => resolveComplaintMutation.mutate({ id: order.id, resolution: 'REPLACE' })}
                                disabled={resolveComplaintMutation.isPending}
                                className="bg-[#16a34a]/10 text-[#16a34a] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#16a34a]/20 transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                                {resolveComplaintMutation.isPending ? <FiLoader className="animate-spin" size={12} /> : <FiCheckCircle size={12} />}
                                Replace
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => window.confirm("Delete this order?") && deleteOrderMutation.mutate(order.id)}
                            disabled={deleteOrderMutation.isPending}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete Order"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center text-slate-500 italic">
                      No orders found in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Payment Details View Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start z-[2000] p-10 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Order Details</h3>
                <p className="text-slate-500 text-sm mt-1">#{viewingOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-3">
                <h4 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest mb-4">Order Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Customer:</span>
                    <p className="text-white font-semibold mt-0.5">{viewingOrder.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <p className="text-white font-semibold mt-0.5">{viewingOrder.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Amount:</span>
                    <p className="text-[#16a34a] font-bold text-lg mt-0.5">${parseFloat(viewingOrder.totalAmount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <p className="text-white font-semibold mt-0.5">{viewingOrder.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Method:</span>
                    <p className="text-white font-semibold mt-0.5">{viewingOrder.paymentMethod || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Status:</span>
                    <p className={`font-bold mt-0.5 ${['PAID', 'FULLY_PAID', 'DEPOSIT_PAID'].includes(viewingOrder.paymentStatus) ? 'text-emerald-400' : 'text-red-400'}`}>{viewingOrder.paymentStatus}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Shipping Address:</span>
                    <p className="text-white font-semibold mt-0.5">{viewingOrder.shippingAddress || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Placed On:</span>
                    <p className="text-white font-semibold mt-0.5">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items & Supplier Attribution */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 text-left">
                <h4 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest">Ordered Items & Supplier Attribution</h4>
                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {viewingOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl text-xs">
                        <div>
                          <p className="text-white font-bold text-sm">{item.product?.name || "Agricultural Item"}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Supplier: <span className="text-emerald-400 font-bold">{item.product?.supplier?.supplierBusinessName || item.product?.supplier?.name || "Direct Wholesale"}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{item.quantity} x ${item.price}</p>
                          <p className="text-emerald-400 font-extrabold text-xs mt-0.5">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">No line items recorded for this order.</p>
                )}
              </div>

              {/* Payment History */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                <h4 className="text-[#16a34a] font-bold text-xs uppercase tracking-widest">Payment Transactions</h4>
                {viewingOrder.payments && viewingOrder.payments.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {viewingOrder.payments.map((p, index) => (
                      <div key={p.id || index} className="bg-black/40 border border-white/5 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#16a34a] font-bold uppercase tracking-wider">{p.type} PAYMENT</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-300">
                          <div>
                            <span className="text-slate-500 block">Amount:</span>
                            <span className="font-bold text-white">${parseFloat(p.amount || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Method:</span>
                            <span className="font-bold text-white">{p.method} {p.manualType ? `(${p.manualType})` : ""}</span>
                          </div>
                          {p.phoneNumber && (
                            <div>
                              <span className="text-slate-500 block">Phone Charged:</span>
                              <span className="font-semibold">{p.phoneNumber}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500 block">Date:</span>
                            <span>{new Date(p.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {p.paymentInfo && (
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-slate-500 block mb-1">Details/Proof Info:</span>
                            <pre className="bg-black/60 border border-white/5 rounded-lg p-2 font-mono text-[10px] text-green-400 overflow-x-auto max-h-32">
                              {JSON.stringify(p.paymentInfo, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No payment records found for this order.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-start z-[2000] p-10 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white">Create Manual Order</h3>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 hover:bg-white/5 rounded-full text-slate-400"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleManualOrderSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Customer</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#16a34a] transition-all"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">Select Customer</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Shipping Address</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#16a34a] transition-all min-h-[80px]"
                  placeholder="E.g. 123 Luxury Lane, Milan"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Payment Method</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#16a34a] transition-all"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {/* <option value="Cash" className="bg-slate-900">Cash / Offline</option> */}
                    {/* <option value="Card" className="bg-slate-900">Credit Card</option> */}
                    <option value="EVC Plus" className="bg-slate-900">EVC Plus</option>
                    {/* <option value="eDahab" className="bg-slate-900">eDahab</option> */}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Note / Comment</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-[#16a34a] transition-all"
                    placeholder="E.g. Call before delivery"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-400">Order Items</label>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    className="text-xs bg-[#16a34a]/10 text-[#16a34a] px-3 py-1.5 rounded-lg hover:bg-[#16a34a]/20 font-bold transition-all"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-end bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">Product</label>
                        <select
                          className="w-full bg-slate-800 border-none rounded-lg px-3 py-2 text-xs text-white focus:ring-1 ring-[#16a34a] outline-none"
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          required
                        >
                          <option value="" disabled>Select Product</option>
                          {products?.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">Qty</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-slate-800 border-none rounded-lg px-3 py-1.5 text-xs text-white focus:ring-1 ring-[#16a34a] outline-none"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          required
                        />
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">Price</label>
                        <div className="w-full bg-white/5 py-2 px-3 rounded-lg text-xs text-white border border-white/5 text-center font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProductRow(index)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all self-center"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-widest block">Total Order Value</span>
                  <span className="text-2xl font-bold text-[#16a34a]">
                    ${orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="bg-[#16a34a] text-black font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
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
      {/* ===== Cancel Order Modal ===== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[3000] p-6">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Cancel Order #{cancelModalOrder.id.slice(0, 8).toUpperCase()}</h3>
                <p className="text-slate-500 text-xs mt-0.5">Specify cancellation reason and refund processing option.</p>
              </div>
              <button onClick={() => setCancelModalOrder(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
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
                cancelOrderWithRefundMutation.mutate({
                  id: cancelModalOrder.id,
                  payload: {
                    reason: cancelReason,
                    refundedNow: cancelRefundedNow,
                    amount: amt,
                  },
                });
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason for Cancellation *</label>
                <textarea
                  required
                  placeholder="E.g. Customer requested cancellation / Out of stock"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#16a34a] transition-all min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refund Customer Now?</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="radio"
                      name="cancelRefundedNow"
                      checked={cancelRefundedNow === true}
                      onChange={() => setCancelRefundedNow(true)}
                      className="accent-[#16a34a]"
                    />
                    Yes (Confirmed Refunded)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="radio"
                      name="cancelRefundedNow"
                      checked={cancelRefundedNow === false}
                      onChange={() => setCancelRefundedNow(false)}
                      className="accent-[#16a34a]"
                    />
                    No (Mark Pending)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refund Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cancelAmount}
                  onChange={(e) => setCancelAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#16a34a] transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 py-3 bg-white/5 text-slate-300 font-bold rounded-xl hover:bg-white/10 transition-all text-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={cancelOrderWithRefundMutation.isPending}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cancelOrderWithRefundMutation.isPending ? <FiLoader className="animate-spin" /> : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Confirm Money Returned Modal ===== */}
      {confirmRefundModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[3000] p-6">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Money Returned</h3>
                <p className="text-slate-500 text-xs mt-0.5">Confirm customer refund payment receipt.</p>
              </div>
              <button onClick={() => setConfirmRefundModal(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Has money been returned to customer?</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="radio"
                      name="confirmRefundedNow"
                      checked={cancelRefundedNow === true}
                      onChange={() => setCancelRefundedNow(true)}
                      className="accent-[#16a34a]"
                    />
                    Yes (Confirm REFUNDED)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="radio"
                      name="confirmRefundedNow"
                      checked={cancelRefundedNow === false}
                      onChange={() => setCancelRefundedNow(false)}
                      className="accent-[#16a34a]"
                    />
                    No (Keep PENDING)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cancelAmount}
                  onChange={(e) => setCancelAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#16a34a] transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#16a34a] transition-all min-h-[70px]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setConfirmRefundModal(null)}
                  className="flex-1 py-3 bg-white/5 text-slate-300 font-bold rounded-xl hover:bg-white/10 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmRefundMutation.isPending}
                  className="flex-1 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
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


