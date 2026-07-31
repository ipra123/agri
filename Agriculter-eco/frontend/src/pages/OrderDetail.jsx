import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "../lib/api";
import useAuthStore from "../store/useAuthStore";
import {
  FiArrowLeft,
  FiClock,
  FiMessageSquare,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiTruck,
  FiX,
  FiCheckCircle,
  FiSmartphone,
  FiAlertTriangle
} from "react-icons/fi";

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const OrderDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [complaintText, setComplaintText] = useState("");
  const [disputeType, setDisputeType] = useState("WRONG_DELIVERY");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      toast.success("Order cancelled");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to cancel order"),
  });

  const complaintMutation = useMutation({
    mutationFn: (comment) => api.post(`/orders/${id}/complaint`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      setComplaintText("");
      toast.success("Dispute complaint submitted for admin review");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to submit dispute"),
  });

  useEffect(() => {
    if (!id) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true,
    });

    socket.emit("join-order", id);
    socket.on("statusUpdate", ({ status }) => {
      queryClient.setQueryData(["order", id], (old) => (old ? { ...old, status } : old));
    });

    return () => socket.disconnect();
  }, [id, queryClient]);

  const timeline = useMemo(() => {
    const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentIndex = steps.indexOf(order?.status);
    return steps.map((step, index) => ({
      step,
      active: currentIndex >= index,
    }));
  }, [order?.status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] flex flex-col items-center justify-center text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest font-bold">Loading Order Information...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-white flex flex-col items-center justify-center space-y-4 pt-20">
        <h2 className="text-2xl font-black font-heading">Order Not Found</h2>
        <Link to="/my-orders" className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider">
          Return to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0a0f1d] min-h-screen text-slate-900 dark:text-slate-100 pt-28 pb-20 font-body transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-5xl text-left space-y-8">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-amber-400 transition-colors uppercase text-xs font-bold tracking-widest"
        >
          <FiArrowLeft /> Back to My Orders
        </Link>

        {/* Order Header Box */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-amber-400 uppercase tracking-widest block mb-1">
                AgriSmart Order Receipt
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
                Order #{order.id.slice(0, 16)}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FiSmartphone className="text-amber-500" /> {order.paymentMethod || "EVC Plus"}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 font-extrabold text-xs uppercase tracking-wider">
                Status: {order.status}
              </span>
            </div>
          </div>

          {/* Delivery Timeline Progress */}
          <div className="py-4">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">
              Fulfillment Timeline
            </h4>
            <div className="grid grid-cols-4 gap-2 relative">
              {timeline.map(({ step, active }, i) => (
                <div key={step} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      active
                        ? "bg-emerald-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {active ? <FiCheckCircle className="text-base" /> : i + 1}
                  </div>
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider ${active ? "text-emerald-600 dark:text-amber-400" : "text-slate-400"}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details & Items Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Item List */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-black font-heading text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              Purchased Farm Inputs
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  <img
                    src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150&auto=format"}
                    alt={item.product?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-amber-400 font-extrabold block mb-0.5">
                      {item.product?.category || "Agricultural Input"}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      {item.product?.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.quantity} x ${item.price} {item.product?.unit ? `per ${item.product.unit}` : ""}
                    </p>
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-amber-400">
                    ${item.quantity * item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Address & Payment Breakdown */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black font-heading uppercase tracking-wider text-slate-900 dark:text-white">
                Logistics & Payment Details
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] block">Shipping Address</span>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">{order.shippingAddress}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] block">Mobile Money Reference</span>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{order.last4Digits || "Verified via API"}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="text-slate-900 dark:text-white">${order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Shipping & Delivery</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-sm">
                  <span className="font-black text-slate-900 dark:text-white">Total Amount</span>
                  <span className="font-black text-emerald-600 dark:text-amber-400">${order.totalAmount}</span>
                </div>
              </div>

              {order.status === "PENDING" && (
                <button
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                >
                  Cancel Order
                </button>
              )}
            </div>

            {/* Dispute / Complaint Section */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                <FiAlertTriangle className="text-amber-500 text-base" /> Report Dispute / Complaint
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Received wrong delivery, damaged tools, or uncertified seed? File a complaint directly for admin investigation.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!complaintText) return;
                  complaintMutation.mutate(`[${disputeType}] ${complaintText}`);
                }}
                className="space-y-3"
              >
                <select
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="WRONG_DELIVERY">Wrong Product Delivered</option>
                  <option value="FAKE_PRODUCT">Counterfeit or Fake Product</option>
                  <option value="DAMAGED_GOODS">Damaged Inputs or Equipment</option>
                  <option value="OTHER">Other Issues</option>
                </select>

                <textarea
                  rows="3"
                  placeholder="Describe your issue in detail..."
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  required
                />

                <button
                  type="submit"
                  disabled={complaintMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  {complaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
