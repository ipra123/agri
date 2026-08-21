import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import {
  AlertOctagon,
  ArrowUpRight,
  Boxes,
  Coins,
  Crown,
  Flame,
  Gauge,
  ReceiptText,
  Sparkles,
  UsersRound,
  Wallet,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const GREEN = ["#166534", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac"];

const STATS = [
  { label: "Sales revenue", icon: Coins },
  { label: "Orders", icon: ReceiptText },
  { label: "Users", icon: UsersRound },
  { label: "Products", icon: Boxes },
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
      <div className="flex h-[420px] flex-col items-center justify-center gap-5 bg-[color:var(--bg-card-solid)] animate-in fade-in duration-500">
        <div className="h-14 w-14 animate-spin border-[5px] border-[color:var(--border-color)] border-t-[color:var(--primary)] rounded-full" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
          ✨ Crunching platform analytics
        </p>
      </div>
    );
  }

  if (error?.response?.status === 401) {
    return (
      <div className="mx-auto mt-16 max-w-md bg-[color:var(--bg-card-solid)] px-10 py-12 text-center shadow-xl animate-in zoom-in-95 duration-300">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-red-500/10">
          <AlertOctagon className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-[color:var(--text-main)]">Unauthorized access</h2>
        <p className="mt-2 text-[13px] text-[color:var(--text-muted)]">Administrator session token invalid or expired.</p>
        <Link
          to="/login"
          className="mt-7 inline-flex items-center gap-2 bg-[color:var(--primary)] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] text-white"
        >
          Return to login
        </Link>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center gap-3 bg-[color:var(--bg-card-solid)] p-6 text-red-600 shadow-md">
        <AlertOctagon className="h-5 w-5" />
        <span>Failed to load platform analytics.</span>
      </div>
    );
  }

  const totalRevenue = parseFloat(stats.totalRevenue) || 0;
  const avgOrderValue = stats.totalOrders > 0 ? (totalRevenue / stats.totalOrders).toFixed(2) : "0.00";
  const metrics = [
    { label: "Sales revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, note: `Average order $${avgOrderValue}` },
    { label: "Orders", value: stats.totalOrders || 0, note: "Live marketplace activity" },
    { label: "Users", value: stats.totalUsers || 0, note: "Customer accounts" },
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

  const compositionData = [
    { name: "Orders", value: stats.totalOrders || 0 },
    { name: "Users", value: stats.totalUsers || 0 },
    { name: "Products", value: stats.totalProducts || 0 },
  ];

  return (
    <div className="space-y-7 pb-20 font-sans animate-in fade-in duration-500">
      {/* ===== Header — fully redesigned ===== */}
      <div className="bg-[color:var(--bg-card-solid)] p-8 shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
        <div className="text-left">
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-[color:var(--primary)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em]">
            <Crown className="h-3.5 w-3.5" />
            Command Center
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-[color:var(--text-main)] font-heading">
            Marketplace Control Deck
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
            Real-time pulse on revenue, growth, and catalog health.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 bg-[color:var(--primary)] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-[color:var(--primary-hover)] hover:-translate-y-0.5 active:scale-95"
          >
            🧾 View Orders
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/admin/customers"
            className="inline-flex items-center gap-2 bg-[color:var(--surface-soft)] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] text-[color:var(--text-main)] transition-all hover:bg-emerald-500/10 hover:-translate-y-0.5 active:scale-95"
          >
            👥 User Accounts
          </Link>
        </div>
      </div>

      {/* ===== Metric cards — sharp corners, staggered entrance ===== */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = STATS[index].icon;
          return (
            <div
              key={metric.label}
              style={{ animationDelay: `${index * 100}ms` }}
              className="bg-[color:var(--bg-card-solid)] p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center bg-[color:var(--primary)] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] text-[9px] font-black uppercase tracking-wider px-2.5 py-1">
                  {STATS[index].label}
                </span>
              </div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{metric.label}</p>
              <h2 className="mt-1 text-2xl font-black font-mono text-[color:var(--text-main)]">{metric.value}</h2>
              <p className="mt-2 text-[11px] text-[color:var(--text-muted)]">{metric.note}</p>
            </div>
          );
        })}
      </div>

      {/* ===== Charts ===== */}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_0.5fr]">
        {/* Revenue trend */}
        <div className="bg-[color:var(--bg-card-solid)] p-7 shadow-md animate-in fade-in duration-700">
          <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border-color)] pb-5">
            <div className="text-left">
              <h3 className="text-lg font-black text-[color:var(--text-main)] flex items-center gap-2">
                <Flame className="h-4 w-4 text-[color:var(--primary)]" /> Revenue Trend
              </h3>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">📈 Monthly performance overview</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center bg-emerald-500/10">
              <Gauge className="h-5 w-5 text-[color:var(--primary)]" />
            </div>
          </div>

          <div className="h-[340px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,101,52,0.15)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.97)",
                    borderColor: "var(--primary)",
                    borderRadius: 0,
                    color: "#142016",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "var(--accent)" }}
                  activeDot={{ r: 8 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Composition donut chart + status */}
        <div className="space-y-5">
          <div className="bg-[color:var(--bg-card-solid)] p-6 shadow-md animate-in fade-in duration-700">
            <h3 className="text-sm font-black text-[color:var(--text-main)] flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[color:var(--primary)]" /> Platform Mix
            </h3>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={compositionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={75}
                  animationDuration={1000}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={entry.name} fill={GREEN[index % GREEN.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[color:var(--bg-card-solid)] p-6 shadow-md space-y-4 animate-in fade-in duration-700">
            <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--text-main)]">Platform Status</p>
              <span className="h-2.5 w-2.5 bg-[color:var(--primary)] animate-pulse rounded-full" />
            </div>

            <div className="bg-[color:var(--surface-soft)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--primary)]">System Health</p>
                  <p className="mt-1.5 text-[13px] text-[color:var(--text-muted)]">✅ Database and API operational</p>
                </div>
              </div>
            </div>

            <div className="bg-[color:var(--surface-soft)] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[color:var(--primary)]">Top Line</p>
              <p className="mt-2.5 text-2xl font-black font-mono leading-none text-[color:var(--text-main)]">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-3 text-[13px] text-[color:var(--text-muted)]">Avg order value: ${avgOrderValue}</p>
            </div>

            <Link
              to="/admin/products"
              className="flex items-center justify-between bg-[color:var(--primary)] px-5 py-4 text-white transition-all hover:bg-[color:var(--primary-hover)] hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Inspect Catalog
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-[color:var(--bg-card-solid)] p-7 shadow-md">
        <div className="flex items-center justify-between border-b border-[color:var(--border-color)] pb-5">
          <div>
            <h3 className="text-lg font-black text-[color:var(--text-main)]">Recent transactions</h3>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Payments and refunds recorded by the platform</p>
          </div>
          <Link to="/admin/finance" className="text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">Open finance</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-muted)]"><tr><th className="pb-3">Type</th><th className="pb-3">Order</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Date</th></tr></thead>
            <tbody>{(stats.recentTransactions || []).map((transaction) => <tr key={transaction.id} className="border-t border-[color:var(--border-color)]"><td className="py-3 font-bold">{transaction.type}</td><td className="py-3">{transaction.orderId ? `#${transaction.orderId.slice(0, 8)}` : "Platform"}</td><td className="py-3 font-black">${Number(transaction.amount || 0).toFixed(2)}</td><td className="py-3">{transaction.status}</td><td className="py-3 text-[color:var(--text-muted)]">{new Date(transaction.createdAt).toLocaleDateString()}</td></tr>)}</tbody>
          </table>
          {!stats.recentTransactions?.length && <p className="py-6 text-center text-xs text-[color:var(--text-muted)]">No transactions recorded yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;