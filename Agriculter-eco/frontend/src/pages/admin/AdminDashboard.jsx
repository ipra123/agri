import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiBarChart2,
  FiAlertCircle,
  FiShield,
  FiBox,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STATS = [
  { label: "Total sales revenue", icon: FiDollarSign, tone: "text-[color:var(--primary)]" },
  { label: "Total orders", icon: FiShoppingBag, tone: "text-[color:var(--accent)]" },
  { label: "Registered users", icon: FiUsers, tone: "text-[color:var(--primary)]" },
  { label: "Listed products", icon: FiBox, tone: "text-[color:var(--accent)]" },
];

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
      <div className="dashboard-panel flex h-96 flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[color:var(--border-color)] border-t-[color:var(--accent)]" />
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
          Loading dashboard analytics
        </p>
      </div>
    );
  }

  if (error?.response?.status === 401) {
    return (
      <div className="dashboard-panel mx-auto mt-12 max-w-lg text-center">
        <FiAlertCircle className="mx-auto mb-4 text-4xl text-red-500" />
        <h2 className="text-2xl font-black text-[color:var(--text-main)]">Unauthorized access</h2>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">Administrator session token invalid or expired.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white"
        >
          Return to login
        </Link>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-panel flex items-center gap-3 text-red-600">
        <FiAlertCircle className="text-xl" />
        <span>Failed to load platform analytics.</span>
      </div>
    );
  }

  const totalRevenue = parseFloat(stats.totalRevenue) || 0;
  const avgOrderValue = stats.totalOrders > 0 ? (totalRevenue / stats.totalOrders).toFixed(2) : "0.00";
  const metrics = [
    { label: "Sales revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, note: `Average order $${avgOrderValue}` },
    { label: "Orders", value: stats.totalOrders || 0, note: "Live marketplace activity" },
    { label: "Users", value: stats.totalUsers || 0, note: "Active customer profiles" },
    { label: "Products", value: stats.totalProducts || 0, note: "Across all categories" },
  ];

  const monthlyData = stats.monthlyRevenue || [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 1900 },
    { month: "Mar", revenue: 3400 },
    { month: "Apr", revenue: 2800 },
    { month: "May", revenue: 4500 },
    { month: "Jun", revenue: 6200 },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="dashboard-toolbar">
        <div className="text-left">
          <span className="section-eyebrow">
            <FiShield />
            Admin overview
          </span>
          <h1 className="mt-4">Platform analytics and marketplace control</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
            A calmer dashboard surface with stronger hierarchy, warmer surfaces, and cleaner KPI cards.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white"
          >
            View orders
            <FiArrowRight />
          </Link>
          <Link
            to="/admin/customers"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--text-main)]"
          >
            User accounts
          </Link>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--4">
        {metrics.map((metric, index) => {
          const Icon = STATS[index].icon;
          return (
            <div key={metric.label} className="dashboard-card">
              <div className="metric-row">
                <div className="stat-card__icon">
                  <Icon />
                </div>
                <span className="brand-pill">{STATS[index].label}</span>
              </div>
              <p className="dashboard-card__label mt-5">{metric.label}</p>
              <h2 className="dashboard-card__value">{metric.value}</h2>
              <p className="dashboard-card__meta">{metric.note}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="dashboard-panel">
          <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border-color)] pb-4">
            <div className="text-left">
              <h3 className="text-xl font-black text-[color:var(--text-main)]">Revenue trend</h3>
              <p className="text-xs text-[color:var(--text-muted)]">Monthly performance trajectory</p>
            </div>
            <FiBarChart2 className="text-2xl text-[color:var(--primary)]" />
          </div>

          <div className="h-80 pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,32,22,0.12)" />
                <XAxis dataKey="month" stroke="rgba(91,102,92,0.9)" fontSize={12} />
                <YAxis stroke="rgba(91,102,92,0.9)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.96)",
                    borderColor: "rgba(20,32,22,0.12)",
                    borderRadius: 16,
                    color: "#142016",
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--accent)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-panel space-y-4">
          <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-4">
            <div className="text-left">
              <h3 className="text-xl font-black text-[color:var(--text-main)]">Platform status</h3>
              <p className="text-xs text-[color:var(--text-muted)]">Operational snapshot</p>
            </div>
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">System health</p>
                  <p className="text-sm text-[color:var(--text-muted)]">Database and API operational</p>
                </div>
                <FiCheckCircle className="text-xl text-emerald-500" />
              </div>
            </div>

            <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">Top line</p>
              <p className="mt-2 text-3xl font-black text-[color:var(--text-main)]">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">Average order value: ${avgOrderValue}</p>
            </div>

            <Link
              to="/admin/products"
              className="flex items-center justify-between rounded-3xl bg-[color:var(--primary)] px-4 py-4 text-white transition hover:bg-[color:var(--primary-hover)]"
            >
              <span className="text-sm font-black uppercase tracking-[0.18em]">Inspect catalog</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
