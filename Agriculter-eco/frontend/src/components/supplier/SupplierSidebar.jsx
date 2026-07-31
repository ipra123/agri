import { NavLink } from "react-router-dom";
import { FiGrid, FiBox, FiShoppingBag, FiUser, FiArrowLeft, FiBriefcase } from "react-icons/fi";
import useAuthStore from "../../store/useAuthStore";

const NAV_ITEMS = [
  { to: "/supplier", end: true, icon: <FiGrid />, label: "Overview & Reports" },
  { to: "/supplier/products", icon: <FiBox />, label: "My Products" },
  { to: "/supplier/orders", icon: <FiShoppingBag />, label: "Received Orders" },
  { to: "/supplier/profile", icon: <FiUser />, label: "Profile & KYC" },
];

const SupplierSidebar = () => {
  const { user } = useAuthStore();

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      {/* Header */}
      <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-700/20">
          <FiBriefcase />
        </div>
        <div className="text-left">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-wider">
            SUPPLIER<span className="text-amber-500">HUB</span>
          </h3>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-extrabold">Partner Console</p>
        </div>
      </div>

      {/* Merchant Label */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 text-left">
        <span className="text-[9px] uppercase tracking-[2px] text-slate-500 dark:text-slate-400 font-bold block mb-1">Active Business</span>
        <p className="text-xs font-extrabold text-blue-700 dark:text-amber-400 truncate">
          {user?.supplierBusinessName || user?.businessName || user?.name}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5 text-left">
        {NAV_ITEMS.map(({ to, end, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md shadow-blue-600/20 dark:shadow-amber-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`
            }
          >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
        >
          <FiArrowLeft className="text-base" />
          <span>Exit to Market</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default SupplierSidebar;
