import { Link } from "react-router-dom";
import { FiInstagram, FiTwitter, FiFacebook, FiHeart, FiMail, FiArrowUpRight, FiShield, FiSmartphone } from "react-icons/fi";
import { useSettings } from "../hooks";
import brandLogo from "../assets/logo.png";

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="relative overflow-hidden border-t border-[color:var(--border-color)] bg-[color:var(--bg-card-solid)] pt-20 pb-8">
      <div className="absolute left-1/2 top-0 h-[320px] w-[760px] -translate-x-1/2 rounded-full bg-[color:var(--primary)]/10 blur-[140px] pointer-events-none" />

      <div className="section-shell relative z-10">
        <div className="grid gap-12 lg:grid-cols-4 mb-16 text-left">
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-flex items-center gap-4">
              <img src={brandLogo} alt="brand" className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[color:var(--border-color)]" />
              <div>
                <h3 className="text-2xl font-black tracking-[0.18em] text-[color:var(--text-main)]">AGRIECO MARKET</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                  certified farm supplies
                </p>
              </div>
            </Link>
            <p className="max-w-xl text-sm leading-7 text-[color:var(--text-muted)]">
              A modern agricultural marketplace connecting farmers, verified suppliers, and cooperatives with clean sourcing, season-ready stock, and instant mobile-money payments.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-3 py-2">
                <FiShield /> Verified suppliers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] px-3 py-2">
                <FiSmartphone /> Mobile money ready
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Agricultural Inputs</h4>
            <ul className="space-y-3">
              {[
                { name: "Certified Seeds", path: "/shop?category=SEEDS" },
                { name: "Fertilizers", path: "/shop?category=FERTILIZERS" },
                { name: "Crop Protection", path: "/shop?category=PESTICIDES" },
                { name: "Farm Tools", path: "/shop?category=FARM_TOOLS" },
                { name: "Irrigation", path: "/shop?category=IRRIGATION_EQUIPMENT" },
                { name: "Animal Feed", path: "/shop?category=ANIMAL_FEED" },
              ].map((item) => (
                <li key={item.name}>
                  <Link className="group inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--primary)]" to={item.path}>
                    <span>{item.name}</span>
                    <FiArrowUpRight className="opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.24em] text-[color:var(--accent)]">Support</h4>
            <a
              href={`mailto:${settings?.contactEmail || "support@agrieco.market"}`}
              className="flex items-center gap-2 text-sm text-[color:var(--text-main)] transition hover:text-[color:var(--primary)]"
            >
              <FiMail className="text-[color:var(--accent)]" />
              <span>{settings?.contactEmail || "support@agrieco.market"}</span>
            </a>
            <p className="text-xs leading-6 text-[color:var(--text-muted)]">
              Need help with orders, onboarding, or supplier verification? Our support team is available around the clock.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-divider" />

        <div className="flex flex-col items-start justify-between gap-4 pt-6 text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)] md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} AGRIECO MARKET. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built for farmers with <FiHeart className="text-[color:var(--accent)]" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
