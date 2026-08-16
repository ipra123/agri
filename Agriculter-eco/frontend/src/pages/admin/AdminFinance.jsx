import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Download,
  Filter,
  Landmark,
  TrendingUp,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../lib/api";

// Circular ring stat card
const RingStat = ({ icon: Icon, label, value, color, sub }) => {
  const circumference = 2 * Math.PI * 40;
  return (
    <div className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-6 shadow-sm flex flex-col items-center text-center">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--surface-soft)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.22}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            <Icon size={20} />
          </div>
        </div>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">{label}</p>
      <h3 className="mt-1.5 text-2xl font-black text-[color:var(--text-main)]">{value}</h3>
      {sub && <p className="mt-2 text-[10px] text-[color:var(--text-muted)]">{sub}</p>}
    </div>
  );
};

const AdminFinance = () => {
  const { data: transactions } = useQuery({
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

  const grossRevenue = Number(summary?.grossRevenue ?? 0);
  const totalRefunded = Number(summary?.totalRefunded ?? 0);
  const netRevenue = Number(summary?.netRevenue ?? grossRevenue - totalRefunded);

  const chartData = useMemo(() => {
    if (summary?.monthlyRevenue?.length) return summary.monthlyRevenue;
    if (!transactions?.length) {
      return [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 0 },
        { month: "Mar", revenue: 0 },
        { month: "Apr", revenue: 0 },
        { month: "May", revenue: 0 },
        { month: "Jun", revenue: 0 },
      ];
    }
    const byMonth = {};
    transactions.forEach((t) => {
      if (t.type !== "PAYMENT") return;
      const d = new Date(t.createdAt);
      const key = d.toLocaleDateString(undefined, { month: "short" });
      byMonth[key] = (byMonth[key] || 0) + Number(t.amount || 0);
    });
    return Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue }));
  }, [summary, transactions]);

  return (
    <div className="space-y-7 pb-20 transition-colors duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-7">
        <div>
          <h1 className="text-2xl font-black font-heading text-[color:var(--text-main)]">
            Financial Reports
          </h1>
          <p className="mt-1.5 text-[13px] text-[color:var(--text-muted)]">
            Track revenue and refund flow across the marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-main)] transition-all hover:border-[color:var(--primary)] active:scale-95">
            <Filter size={13} />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--primary)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-[color:var(--primary-hover)] active:scale-95">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Circular ring summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <RingStat
          icon={Landmark}
          label="Gross Revenue"
          value={`$${grossRevenue.toFixed(2)}`}
          color="#3b82f6"
          sub="Orders with paid deposit or full payment"
        />
        <RingStat
          icon={ArrowDownLeft}
          label="Total Refunded"
          value={`$${totalRefunded.toFixed(2)}`}
          color="#ef4444"
          sub="Confirmed refund amounts"
        />
        <RingStat
          icon={Banknote}
          label="Net Revenue"
          value={`$${netRevenue.toFixed(2)}`}
          color="#10b981"
          sub="Gross minus confirmed refunds"
        />
      </div>

      {/* Revenue chart */}
      <div className="rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] p-7 shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[color:var(--border-color)] pb-5">
          <div>
            <h3 className="text-lg font-black text-[color:var(--text-main)]">Revenue Trend</h3>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Payment inflow over time</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--surface-soft)]">
            <TrendingUp size={18} className="text-[color:var(--primary)]" />
          </div>
        </div>
        <div className="h-[340px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,32,22,0.12)" />
              <XAxis dataKey="month" stroke="rgba(91,102,92,0.9)" fontSize={11} />
              <YAxis stroke="rgba(91,102,92,0.9)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.96)",
                  borderColor: "rgba(20,32,22,0.12)",
                  borderRadius: 20,
                  color: "#142016",
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5, fill: "var(--accent)" }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;