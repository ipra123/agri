import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import { 
  FiBox, FiShoppingBag, FiActivity, FiTrendingUp, 
  FiAlertTriangle, FiDollarSign, FiArrowRight, 
  FiPieChart, FiTruck, FiCheckCircle, FiFileText 
} from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const SupplierDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["supplier-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/supplier/dashboard");
      return data;
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ["supplier-profile"],
    queryFn: async () => {
      const { data } = await api.get("/auth/profile");
      return data;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["supplier-products-list"],
    queryFn: async () => {
      if (!profileData?.id) return [];
      const { data } = await api.get(`/products?supplierId=${profileData.id}`);
      return data;
    },
    enabled: !!profileData?.id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-[4px] font-bold">Loading Merchant Reports...</p>
      </div>
    );
  }

  const grossRevenue = parseFloat(stats?.revenue || 0);
  const estimatedCommission = grossRevenue * 0.05; // 5% platform fee estimate
  const netEarnings = grossRevenue - estimatedCommission;

  return (
    <div className="space-y-10 text-left pb-16 transition-colors duration-300">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-heading">
            Supplier Business Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time revenue analytics, order fulfillments, and product performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/supplier/products"
            className="px-5 py-3 bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95"
          >
            + Add New Product
          </Link>
          <Link
            to="/supplier/orders"
            className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95"
          >
            Received Orders
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Sales */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiDollarSign />
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 dark:text-amber-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Gross Revenue
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Business Sales</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">${grossRevenue.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-2 font-bold">Direct orders fulfilled</p>
        </div>

        {/* Net Earnings */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiTrendingUp />
            </div>
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Net Earnings
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Net Payable Share</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">${netEarnings.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-2 font-bold">Est. 95% payout rate</p>
        </div>

        {/* Total Orders Received */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiShoppingBag />
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 dark:text-amber-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Received Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Orders</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats?.ordersCount || 0}</h3>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
            <FiCheckCircle /> Customer Fulfillments
          </p>
        </div>

        {/* Listed Catalog */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiBox />
            </div>
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Catalog Items
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">My Active Products</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{productsData?.length || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-2 font-bold">Listed & Searchable</p>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
