import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { FiShoppingBag, FiTruck, FiCheckCircle, FiClock, FiSmartphone, FiArrowRight, FiShield, FiAlertTriangle } from "react-icons/fi";

const MyOrders = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await api.get("/orders/myorders");
      return data;
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-emerald-500/20 flex items-center gap-1"><FiCheckCircle /> Delivered</span>;
      case "SHIPPED":
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-blue-500/20 flex items-center gap-1"><FiTruck /> Shipped</span>;
      case "CONFIRMED":
        return <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-amber-500/20 flex items-center gap-1"><FiClock /> Confirmed</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-red-500/20">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-slate-500/20 flex items-center gap-1"><FiClock /> Pending</span>;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0a0f1d] min-h-screen text-slate-900 dark:text-slate-100 pt-28 pb-20 font-body transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-5xl text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
              My Farm Orders
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Track input delivery status, payment receipts, and supplier fulfillments.
            </p>
          </div>
          <Link
            to="/shop"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all self-start sm:self-auto"
          >
            + Order More Inputs
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest font-bold">Loading Your Orders...</p>
          </div>
        ) : orders?.length === 0 ? (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
            <FiShoppingBag className="text-4xl text-slate-400 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No Orders Placed Yet</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              You haven't purchased any seeds, fertilizers, or farm tools. Browse our marketplace to place your first order.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-full"
            >
              Shop Agricultural Inputs <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Order ID
                    </span>
                    <p className="font-mono text-sm font-black text-slate-900 dark:text-white">
                      #{order.id.slice(0, 13)}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-amber-200 dark:border-slate-700 flex items-center gap-1">
                      <FiSmartphone /> {order.paymentMethod || "EVC Plus"}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                      <img
                        src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&auto=format"}
                        alt={item.product?.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {item.product?.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-bold">
                          Qty: {item.quantity} • ${item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Amount Paid</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-amber-400">${order.totalAmount}</span>
                  </div>

                  <Link
                    to={`/order/${order.id}`}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    <span>View Details & Receipt</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
