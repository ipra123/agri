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
        <div className="bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[color:var(--border-color)]">
            <h3 className="text-lg font-bold text-[color:var(--text-main)]">
              All Orders {orders?.length > 0 && `(${orders.length})`}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[color:var(--surface-soft)] border-b border-[color:var(--border-color)]">
                <tr>
                  <th className="p-6 text-[color:var(--primary)] uppercase text-xs font-bold tracking-wider">Order ID</th>
                  <th className="p-6 text-[color:var(--primary)] uppercase text-xs font-bold tracking-wider">Customer</th>
                  <th className="p-6 text-[color:var(--primary)] uppercase text-xs font-bold tracking-wider">Amount</th>
                  <th className="p-6 text-[color:var(--primary)] uppercase text-xs font-bold tracking-wider">Status</th>
                  <th className="p-6 text-[color:var(--primary)] uppercase text-xs font-bold tracking-wider">Complaints</th>
                  <th className="p-6 text-[color:var(--primary)] uppercase text-xs font-bold tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border-color)]">
                {orders?.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[color:var(--surface-soft)] transition-all">
                      <td className="p-6 font-mono text-[color:var(--text-muted)] text-sm">#{order.id.slice(0, 8)}</td>
                      <td className="p-6">
                        <div className="text-[color:var(--text-main)] font-semibold text-sm">{order.user?.name || "Unknown"}</div>
                        <div className="text-[color:var(--text-muted)] text-xs">{order.user?.email || "-"}</div>
                      </td>
                      <td className="p-6 text-[color:var(--text-main)] font-bold">${parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                      <td className="p-6">
                        <select
                          className={`bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer transition-all ${order.status === 'DELIVERED' ? 'text-emerald-500' :
                            order.status === 'PENDING' ? 'text-blue-500' : 'text-[color:var(--text-muted)]'
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
                            <p className="text-xs text-[color:var(--text-muted)] line-clamp-2 italic max-w-[200px]">"{order.comment}"</p>
                          </div>
                        ) : (
                          <span className="text-[color:var(--text-muted)] text-xs">None</span>
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
                                className="bg-[color:var(--primary)]/10 text-[color:var(--primary)] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[color:var(--primary)]/20 transition-all flex items-center gap-1 disabled:opacity-50"
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
                    <td colSpan="6" className="p-20 text-center text-[color:var(--text-muted)] italic">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-start z-[2000] p-10 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-3xl p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-[color:var(--text-main)]">Order Details</h3>
                <p className="text-[color:var(--text-muted)] text-sm mt-1">#{viewingOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-[color:var(--surface-soft)] rounded-full text-[color:var(--text-muted)]">
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-[color:var(--surface-soft)] rounded-2xl p-6 border border-[color:var(--border-color)] space-y-3">
                <h4 className="text-[color:var(--primary)] font-bold text-xs uppercase tracking-widest mb-4">Order Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[color:var(--text-muted)]">Customer:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Email:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Total Amount:</span>
                    <p className="text-[color:var(--primary)] font-bold text-lg mt-0.5">${parseFloat(viewingOrder.totalAmount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Status:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.status}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Payment Method:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.paymentMethod || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Payment Status:</span>
                    <p className={`font-bold mt-0.5 ${['PAID', 'FULLY_PAID', 'DEPOSIT_PAID'].includes(viewingOrder.paymentStatus) ? 'text-emerald-400' : 'text-red-400'}`}>{viewingOrder.paymentStatus}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[color:var(--text-muted)]">Shipping Address:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{viewingOrder.shippingAddress || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[color:var(--text-muted)]">Placed On:</span>
                    <p className="text-[color:var(--text-main)] font-semibold mt-0.5">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Order Items & Supplier Attribution */}
              <div className="bg-[color:var(--surface-soft)] rounded-2xl p-6 border border-[color:var(--border-color)] space-y-4 text-left">
                <h4 className="text-[color:var(--primary)] font-bold text-xs uppercase tracking-widest">Ordered Items & Supplier Attribution</h4>
                {viewingOrder.items && viewingOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {viewingOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-xl text-xs">
                        <div>
                          <p className="text-[color:var(--text-main)] font-bold text-sm">{item.product?.name || "Agricultural Item"}</p>
                          <p className="text-[color:var(--text-muted)] text-[11px] mt-0.5">
                            Supplier: <span className="text-[color:var(--primary)] font-bold">{item.product?.supplier?.supplierBusinessName || item.product?.supplier?.name || "Direct Wholesale"}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[color:var(--text-main)] font-bold">{item.quantity} x ${item.price}</p>
                          <p className="text-[color:var(--primary)] font-extrabold text-xs mt-0.5">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[color:var(--text-muted)] text-xs italic">No line items recorded for this order.</p>
                )}
              </div>

              {/* Payment History */}
              <div className="bg-[color:var(--surface-soft)] rounded-2xl p-6 border border-[color:var(--border-color)] space-y-4">
                <h4 className="text-[color:var(--primary)] font-bold text-xs uppercase tracking-widest">Payment Transactions</h4>
                {viewingOrder.payments && viewingOrder.payments.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {viewingOrder.payments.map((p, index) => (
                      <div key={p.id || index} className="bg-[color:var(--bg-card-solid)] border border-[color:var(--border-color)] rounded-xl p-4 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[color:var(--primary)] font-bold uppercase tracking-wider">{p.type} PAYMENT</span>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {p.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[color:var(--text-muted)]">
                          <div>
                            <span className="text-[color:var(--text-muted)] block">Amount:</span>
                            <span className="font-bold text-[color:var(--text-main)]">${parseFloat(p.amount || 0).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[color:var(--text-muted)] block">Method:</span>
                            <span className="font-bold text-[color:var(--text-main)]">{p.method} {p.manualType ? `(${p.manualType})` : ""}</span>
                          </div>
                          {p.phoneNumber && (
                            <div>
                              <span className="text-[color:var(--text-muted)] block">Phone Charged:</span>
                              <span className="font-semibold text-[color:var(--text-main)]">{p.phoneNumber}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-[color:var(--text-muted)] block">Date:</span>
                            <span>{new Date(p.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {p.paymentInfo && (
                          <div className="pt-2 border-t border-[color:var(--border-color)]">
                            <span className="text-[color:var(--text-muted)] block mb-1">Details/Proof Info:</span>
                            <pre className="bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-lg p-2 font-mono text-[10px] text-[color:var(--primary)] overflow-x-auto max-h-32">
                              {JSON.stringify(p.paymentInfo, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[color:var(--text-muted)] text-sm">
                    No payment records found for this order.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
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
                          <FiTrash2 size={14} />
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
      {/* ===== Cancel Order Modal ===== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[3000] p-6">
          <div className="w-full max-w-md bg-[color:var(--bg-card-solid)] border border-red-500/30 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-[color:var(--text-main)]">Cancel Order #{cancelModalOrder.id.slice(0, 8).toUpperCase()}</h3>
                <p className="text-[color:var(--text-muted)] text-xs mt-0.5">Specify cancellation reason and refund processing option.</p>
              </div>
              <button onClick={() => setCancelModalOrder(null)} className="p-2 hover:bg-[color:var(--surface-soft)] rounded-full text-[color:var(--text-muted)]">
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
                <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Reason for Cancellation *</label>
                <textarea
                  required
                  placeholder="E.g. Customer requested cancellation / Out of stock"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-4 py-3 text-sm text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--primary)] transition-all min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Refund Customer Now?</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-sm text-[color:var(--text-main)] cursor-pointer">
                    <input
                      type="radio"
                      name="cancelRefundedNow"
                      checked={cancelRefundedNow === true}
                      onChange={() => setCancelRefundedNow(true)}
                      className="accent-[color:var(--primary)]"
                    />
                    Yes (Confirmed Refunded)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[color:var(--text-main)] cursor-pointer">
                    <input
                      type="radio"
                      name="cancelRefundedNow"
                      checked={cancelRefundedNow === false}
                      onChange={() => setCancelRefundedNow(false)}
                      className="accent-[color:var(--primary)]"
                    />
                    No (Mark Pending)
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[color:var(--text-muted)] uppercase tracking-wider">Refund Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={cancelAmount}
                  onChange={(e) => setCancelAmount(e.target.value)}
                  className="w-full bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] rounded-xl px-4 py-3 text-sm text-[color:var(--text-main)] focus:outline-none focus:border-[color:var(--primary)] transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 py-3 bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] text-[color:var(--text-muted)] font-bold rounded-xl hover:text-[color:var(--text-main)] transition-all text-sm"
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
          <div className="w-full max-w-md bg-[color:var(--bg-card-solid)] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-[color:var(--text-main)]">Money Returned</h3>
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
                    Yes (Confirm REFUNDED)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[color:var(--text-main)] cursor-pointer">
                    <input
                      type="radio"
                      name="confirmRefundedNow"
                      checked={cancelRefundedNow === false}
                      onChange={() => setCancelRefundedNow(false)}
                      className="accent-[color:var(--primary)]"
                    />
                    No (Keep PENDING)
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


