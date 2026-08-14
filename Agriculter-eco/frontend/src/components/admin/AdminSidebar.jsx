import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiArrowLeft,
  FiDollarSign,
  FiArchive,
  FiRefreshCw,
  FiSettings,
  FiMessageSquare,
} from "react-icons/fi";
import brandLogo from "../../assets/logo.png";

const NAV_ITEMS = [
  { to: "/admin", end: true, icon: <FiGrid />, label: "Overview" },
  { to: "/admin/products", icon: <FiBox />, label: "Products" },
  { to: "/admin/orders", icon: <FiShoppingBag />, label: "Orders" },
  { to: "/admin/reviews", icon: <FiMessageSquare />, label: "Pending Reviews" },
  { to: "/admin/refunds", icon: <FiRefreshCw />, label: "Cancel orders" },
  { to: "/admin/customers", icon: <FiUsers />, label: "Customers" },
  { to: "/admin/finance", icon: <FiDollarSign />, label: "Finance" },
  // { to: "/admin/inventory", icon: <FiArchive />, label: "Inventory" },
  // { to: "/admin/settings", icon: <FiSettings />, label: "Settings" },
];

const AdminSidebar = () => {
  return (
    <aside className="sidebar-shell flex w-full shrink-0 flex-col border-b border-[color:var(--border-color)] md:w-72 md:border-b-0 md:border-r">
      <div className="flex h-24 items-center gap-3 border-b border-[color:var(--border-color)] px-6">
        <img src={brandLogo} alt="brand" className="h-12 w-12 rounded-2xl object-cover" />
        <div className="text-left">
          <p className="text-base font-black tracking-[0.22em] text-[color:var(--text-main)]">ADMIN</p>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--primary)]">control center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4 text-left">
        {NAV_ITEMS.map(({ to, end, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition ${
                isActive
                  ? "bg-[color:var(--primary)] text-white shadow-lg shadow-emerald-900/10"
                  : "bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] border border-[color:var(--border-color)] hover:border-[color:var(--primary)] hover:text-[color:var(--text-main)]"
              }`
            }
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[color:var(--border-color)] p-4">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-2xl bg-[color:var(--surface-soft)] border border-[color:var(--border-color)] px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
        >
          <FiArrowLeft className="text-base" />
          <span>Exit to market</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
