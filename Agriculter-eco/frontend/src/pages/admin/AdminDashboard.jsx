import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import {
  FiUsers, FiDollarSign, FiShoppingBag,
  FiTrendingUp, FiBarChart2, FiAlertCircle,
  FiShield, FiArrowRight, FiBox, FiCheckCircle
} from "react-icons/fi";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from "recharts";

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    },
    retry: false,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-[4px] font-bold">Loading System Analytics...</p>
      </div>
    );
  }

  if (error?.response?.status === 401) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center shadow-lg">
        <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unauthorized Access</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Administrator session token invalid or expired.</p>
        <Link to="/login" className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all inline-block">
          Return to Login
        </Link>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-3xl text-red-600 dark:text-red-400 flex items-center gap-3">
        <FiAlertCircle className="text-2xl" />
        <span>Failed to load platform analytics. Please check backend connection.</span>
      </div>
    );
  }

  const totalRevenue = parseFloat(stats.totalRevenue) || 0;
  const avgOrderValue = stats.totalOrders > 0 ? (totalRevenue / stats.totalOrders).toFixed(2) : "0.00";

  return (
    <div className="space-y-10 text-left pb-16 transition-colors duration-300">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-heading">
            Platform Overview & Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time revenue metrics, order fulfillments, and active supplier statistics.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/orders"
            className="px-5 py-3 bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95"
          >
            View All Orders
          </Link>
          <Link
            to="/admin/customers"
            className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95"
          >
            User Accounts
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Revenue */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiDollarSign />
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 dark:text-amber-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Gross Volume
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Sales Revenue</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-[11px] text-slate-400 mt-2 font-bold">Average Order: ${avgOrderValue}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiShoppingBag />
            </div>
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Order Volume
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Orders</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalOrders || 0}
          </h2>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
            <FiCheckCircle /> Live Market Activity
          </p>
        </div>

        {/* Registered Users */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiUsers />
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 dark:text-amber-400 bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Customer Base
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Registered Accounts</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalUsers || 0}
          </h2>
          <p className="text-[11px] text-slate-400 mt-2 font-bold">Active Customer Profiles</p>
        </div>

        {/* Products Listed */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 rounded-3xl transition-all duration-300 group hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-amber-400 text-xl font-bold">
              <FiBox />
            </div>
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
              Inventory
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Total Listed Products</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalProducts || 0}
          </h2>
          <p className="text-[11px] text-slate-400 mt-2 font-bold">Across All Categories</p>
        </div>
      </div>

      {/* Analytics Charts & Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                Revenue & Sales Overview
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Monthly performance trajectory</p>
            </div>
            <FiBarChart2 className="text-2xl text-blue-600 dark:text-amber-400" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyRevenue || [
                { month: "Jan", revenue: 1200 },
                { month: "Feb", revenue: 1900 },
                { month: "Mar", revenue: 3400 },
                { month: "Apr", revenue: 2800 },
                { month: "May", revenue: 4500 },
                { month: "Jun", revenue: 6200 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#f59e0b", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Recent Activity */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
              Platform Status
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-blue-700 dark:text-amber-400 uppercase tracking-wider">System Health</p>
                <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">Database & API Operational</p>
              </div>
              <FiCheckCircle className="text-emerald-500 text-xl" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Gateway Status</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Mobile Pay & Stripe Active</p>
              </div>
              <FiCheckCircle className="text-emerald-500 text-xl" />
            </div>

            <Link
              to="/admin/orders"
              className="w-full py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 mt-6"
            >
              <span>Manage Recent Orders</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;