import { NavLink } from "react-router-dom";
import {
  FiGrid, FiBox, FiShoppingBag, FiUsers,
  FiArrowLeft, FiDollarSign, FiArchive,
  FiRefreshCw, FiZap, FiSettings
} from "react-icons/fi";

const NAV_ITEMS = [
  { to: "/admin",            end: true,  icon: <FiGrid />,       label: "Overview"   },
  { to: "/admin/products",              icon: <FiBox />,        label: "Products"   },
  { to: "/admin/orders",                icon: <FiShoppingBag />,label: "Orders"     },
  { to: "/admin/refunds",               icon: <FiRefreshCw />,  label: "Refunds"    },
  { to: "/admin/customers",             icon: <FiUsers />,      label: "Customers"  },
  { to: "/admin/finance",               icon: <FiDollarSign />, label: "Finance"    },
  { to: "/admin/inventory",             icon: <FiArchive />,    label: "Inventory"  },
  { to: "/admin/settings",              icon: <FiSettings />,   label: "Settings"   },
];

const AdminSidebar = () => {
  return (
    <aside className="w-full md:w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-amber-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-blue-700/20">
          <FiZap />
        </div>
        <div className="text-left">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-wider">
            ADMIN<span className="text-amber-500">PANEL</span>
          </h3>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-extrabold">Control Center</p>
        </div>
      </div>

      {/* Navigation */}
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

      {/* Footer Nav */}
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

export default AdminSidebar;