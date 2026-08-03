import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowRight,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiStar,
  FiZap,
  FiUsers,
} from "react-icons/fi";
import { GiWheat, GiPlantSeed } from "react-icons/gi";
import api from "../lib/api";
import useCartStore from "../store/useCartStore";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/hero.png";
import brandLogo from "../assets/logo.png";

const CATEGORY_CARDS = [
  {
    title: "Seeds & Grains",
    dbCategory: "SEEDS",
    copy: "Certified varieties, strong germination, and season-ready stock.",
    tone: "from-[#224c2d] to-[#1e6f3d]",
  },
  {
    title: "Fertilizers",
    dbCategory: "FERTILIZERS",
    copy: "Balanced nutrition for rich soil and healthier yields.",
    tone: "from-[#5e4820] to-[#c99728]",
  },
  {
    title: "Farm Tools",
    dbCategory: "FARM_TOOLS",
    copy: "Hand tools, sprayers, and durable equipment for daily work.",
    tone: "from-[#1d3147] to-[#3a556f]",
  },
  {
    title: "Irrigation",
    dbCategory: "IRRIGATION_EQUIPMENT",
    copy: "Water delivery systems designed for reliable growth.",
    tone: "from-[#13493f] to-[#1f9b74]",
  },
];

const QUICK_STATS = [
  { label: "Verified suppliers", value: "120+", icon: FiShield },
  { label: "Season stock", value: "24/7", icon: FiTruck },
  { label: "Rated products", value: "4.8/5", icon: FiStar },
  { label: "Farmers served", value: "8k+", icon: FiUsers },
];

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await api.get("/products?limit=8");
      return res.data?.products || res.data || [];
    },
  });

  const featured = useMemo(() => featuredProducts.slice(0, 8), [featuredProducts]);

  return (
    <div className="home-page min-h-screen pt-28 pb-16">
      <section className="page-shell page-hero">
        <div className="page-hero__grid">
          <div className="space-y-8 text-left">
            <span className="section-eyebrow">
              <GiWheat />
              Agricultural marketplace
            </span>

            <div className="space-y-5">
              <h1 className="page-hero__title">
                Fresh farm inputs,
                <span className="text-[color:var(--primary)]"> trusted suppliers </span>
                and faster checkout.
              </h1>
              <p className="page-hero__lead">
                Order seeds, fertilizers, irrigation gear, and farm tools from verified suppliers with a brand feel inspired by the reference designs: warm earth tones, soft surfaces, and premium spacing.
              </p>
            </div>

            <div className="page-hero__actions">
              <button
                onClick={() => navigate("/shop")}
                className="inline-flex items-center gap-3 rounded-full bg-[color:var(--primary)] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[color:var(--primary-hover)]"
              >
                Explore marketplace
                <FiArrowRight />
              </button>
              <button
                onClick={() => navigate("/collection")}
                className="inline-flex items-center gap-3 rounded-full border border-[color:var(--border-color)] bg-white/75 px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--text-main)] transition hover:border-[color:var(--primary)]"
              >
                Browse collections
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {QUICK_STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="feature-card">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--surface-soft)] text-[color:var(--primary)]">
                        <Icon />
                      </div>
                      <div>
                        <div className="feature-card__label">{stat.label}</div>
                        <div className="feature-card__value">{stat.value}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="hero-panel p-4 sm:p-5">
              <div className="hero-image">
                <img src={heroImage} alt="Agricultural marketplace" />
                <div className="hero-image__overlay" />
                <div className="hero-image__badge">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--accent)]">
                    <FiZap />
                    Season ready inventory
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    Highlighting the same premium, grounded aesthetic across desktop and mobile.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="stat-card">
                <div className="stat-card__icon">
                  <FiShoppingBag />
                </div>
                <p className="dashboard-card__label">Instant order flow</p>
                <p className="dashboard-card__value">Simple</p>
                <p className="dashboard-card__meta">Clean browsing, product comparison, and quick add to cart.</p>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon">
                  <FiShield />
                </div>
                <p className="dashboard-card__label">Trust signal</p>
                <p className="dashboard-card__value">Verified</p>
                <p className="dashboard-card__meta">Supplier-first marketplace with clearer credibility cues.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block section-block--soft">
        <div className="page-shell">
          <div className="section-heading text-left">
            <span className="section-eyebrow">
              <GiPlantSeed />
              Shop by category
            </span>
            <h2>Curated around the crop cycle</h2>
            <p>
              Each category card uses a rich color block so the layout feels closer to the reference mood boards while still staying clean and modern.
            </p>
          </div>

          <div className="panel-grid panel-grid--4">
            {CATEGORY_CARDS.map((item) => (
              <button
                key={item.title}
                onClick={() => navigate(`/shop?category=${item.dbCategory}`)}
                className={`group overflow-hidden rounded-[28px] border border-white/30 bg-gradient-to-br ${item.tone} p-6 text-left text-white shadow-[0_24px_70px_-36px_rgba(0,0,0,0.5)] transition hover:-translate-y-1`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-lg">
                  <GiWheat />
                </div>
                <h3 className="mt-12 text-2xl font-black leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/82">{item.copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em]">
                  Explore
                  <FiArrowRight className="transition group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="page-shell">
          <div className="section-heading text-left">
            <span className="section-eyebrow">
              <FiStar />
              Featured products
            </span>
            <h2>Top picks from trusted suppliers</h2>
            <p>High-value inputs highlighted with a more editorial, premium layout.</p>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="brand-kpi h-[380px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(item) => addItem(item)}
                  onNavigate={(id) => navigate(`/product/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-block section-block--soft">
        <div className="page-shell">
          <div className="floating-card p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div className="text-left text-white">
                <span className="section-eyebrow border-white/20 bg-white/10 text-white">
                  Verified suppliers
                </span>
                <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                  Built for farmers who want speed, trust, and a cleaner checkout.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
                  The refreshed UI keeps the same marketplace experience while aligning the web surfaces and mobile app around one visual language.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 text-left text-white backdrop-blur">
                <div className="flex items-center gap-3">
                  <img src={brandLogo} alt="brand" className="h-12 w-12 rounded-2xl object-cover" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Marketplace identity</p>
                    <p className="text-lg font-black tracking-[0.16em]">AGRIECO</p>
                  </div>
                </div>
                <div className="brand-divider my-5 bg-white/10" />
                <div className="space-y-3 text-sm text-white/80">
                  <p>Earthy palette, soft glass panels, and stronger hierarchy.</p>
                  <p>One visual system across home, shop, admin, supplier, and mobile.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
