import { Link } from "react-router-dom";
import { FiInstagram, FiTwitter, FiFacebook, FiHeart, FiMail, FiArrowUpRight, FiGlobe, FiSmartphone, FiShield, FiCheckCircle } from "react-icons/fi";
import { useSettings } from "../hooks";

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-slate-950 text-slate-100 pt-20 pb-8 relative overflow-hidden border-t border-slate-800 font-body">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-4 gap-12 mb-16 text-left">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 text-2xl font-black tracking-wider text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-emerald-600/30">
                <FiGlobe />
              </div>
              <span>AGRISMART MARKET</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Connecting farmers, verified agricultural suppliers, and cooperatives across Somalia. Purchase high-germination seeds, NPK fertilizers, irrigation kits, and farm tools with instant EVC Plus & Zaad payments.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><FiShield className="text-sm" /> Verified Suppliers Only</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><FiSmartphone className="text-sm" /> EVC Plus / Zaad Instant</span>
            </div>
          </div>

          {/* Input Categories */}
          <div className="space-y-4">
            <h4 className="text-amber-400 font-extrabold uppercase tracking-widest text-xs">Agricultural Inputs</h4>
            <ul className="space-y-2.5">
              {[
                { name: "Certified Seeds", path: "/shop?category=SEEDS" },
                { name: "NPK & Organic Fertilizers", path: "/shop?category=FERTILIZERS" },
                { name: "Crop Protection Sprays", path: "/shop?category=PESTICIDES" },
                { name: "Farm Tools & Machinery", path: "/shop?category=FARM_TOOLS" },
                { name: "Solar Irrigation Kits", path: "/shop?category=IRRIGATION_EQUIPMENT" },
                { name: "Livestock & Animal Feed", path: "/shop?category=ANIMAL_FEED" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    to={item.path}
                    className="text-slate-400 text-sm hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    {item.name}
                    <FiArrowUpRight className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-amber-400 font-extrabold uppercase tracking-widest text-xs">Farmer Support & KYC</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${settings?.contactEmail || "support@agriconnect.market"}`}
                className="flex items-center gap-2.5 text-slate-300 text-sm hover:text-amber-400 transition-colors"
              >
                <FiMail className="text-amber-400 text-base" />
                <span>{settings?.contactEmail || "support@agriconnect.market"}</span>
              </a>
              <p className="text-slate-400 text-xs leading-relaxed pt-1">
                Need help with mobile money checkout or supplier onboarding? Contact our 24/7 dedicated support team.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <Icon className="text-sm" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs uppercase tracking-widest">
            &copy; {new Date().getFullYear()} AGRISMART MARKET. All rights reserved.
          </p>
          <p className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider">
            Empowering Farmers & Agribusinesses with <FiHeart className="text-amber-500 animate-pulse" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;