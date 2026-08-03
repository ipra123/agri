import { NavLink } from "react-router-dom";
import { FiGrid, FiBox, FiShoppingBag, FiUser, FiArrowLeft, FiBriefcase } from "react-icons/fi";
import useAuthStore from "../../store/useAuthStore";
import brandLogo from "../../assets/logo.png";

const NAV_ITEMS = [
  { to: "/supplier", end: true, icon: <FiGrid />, label: "Overview" },
  { to: "/supplier/products", icon: <FiBox />, label: "My Products" },
  { to: "/supplier/orders", icon: <FiShoppingBag />, label: "Orders" },
  { to: "/supplier/profile", icon: <FiUser />, label: "Profile" },
];

const SupplierSidebar = () => {
  const { user } = useAuthStore();

  return (
    <aside className="sidebar-shell flex w-full shrink-0 flex-col border-b border-[color:var(--border-color)] md:w-72 md:border-b-0 md:border-r">
      <div className="flex h-24 items-center gap-3 border-b border-[color:var(--border-color)] px-6">
        <img src={brandLogo} alt="brand" className="h-12 w-12 rounded-2xl object-cover" />
        <div className="text-left">
          <p className="text-base font-black tracking-[0.22em] text-[color:var(--text-main)]">SUPPLIER</p>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[color:var(--primary)]">partner console</p>
        </div>
      </div>

      <div className="border-b border-[color:var(--border-color)] bg-white/45 px-6 py-4 text-left">
        <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Active business</span>
        <p className="truncate text-xs font-black text-[color:var(--primary)]">
          {user?.supplierBusinessName || user?.businessName || user?.name}
        </p>
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
                  : "bg-white/55 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-main)]"
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
          className="flex items-center gap-3 rounded-2xl bg-white/55 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]"
        >
          <FiArrowLeft className="text-base" />
          <span>Exit to market</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default SupplierSidebar;
