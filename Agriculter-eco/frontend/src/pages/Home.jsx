import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiCheckCircle,
  FiHeadphones,
  FiSmartphone,
  FiStar,
  FiZap,
} from "react-icons/fi";
import { GiWheat, GiPlantSeed } from "react-icons/gi";
import api from "../lib/api";
import useCartStore from "../store/useCartStore";
import toast from "react-hot-toast";

const HERO_SLIDES = [
  {
    eyebrow: "Farmers & Suppliers, One Marketplace",
    headline: "Everything your farm needs,",
    headlineAccent: "delivered",
    headlineTail: "to your doorstep.",
    body: "Browse seeds, fertilizers, pesticides, tools and irrigation equipment from verified suppliers, and pay instantly with mobile money — no queues, no middlemen.",
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600&auto=format&fit=crop",
    cta: { label: "Explore Marketplace", path: "/shop" },
  },
  {
    eyebrow: "New Planting Season Stock",
    headline: "Better yields start with",
    headlineAccent: "certified seeds",
    headlineTail: "& fertilizers.",
    body: "Compare prices across suppliers, check real farmer reviews, and stock up before the season starts — every listing verified for quality.",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1600&auto=format&fit=crop",
    cta: { label: "Shop Seeds & Fertilizers", path: "/shop" },
  },
  {
    eyebrow: "Instant Mobile Money Checkout",
    headline: "Order today,",
    headlineAccent: "pay with EVC Plus,",
    headlineTail: "Zaad or Sahal.",
    body: "Secure checkout built for how farmers actually pay — confirm your order, track delivery, and get a digital receipt in seconds.",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop",
    cta: { label: "Discover More", path: "/collection" },
  },
];

const AUTOPLAY_MS = 6000;

const categories = [
  {
    title: "Seeds & Grains",
    dbCategory: "SEEDS",
    desc: "Certified, high-yield seeds for staple and cash crops",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Fertilizers & Soil Care",
    dbCategory: "FERTILIZERS",
    desc: "Organic and mineral fertilizers to boost every harvest",
    image: "https://images.unsplash.com/photo-1592982573971-2c0a51e5cd45?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Farm Tools & Equipment",
    dbCategory: "FARMTOOLS",
    desc: "Durable hand tools, sprayers, and machinery for every field",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Irrigation & Water Systems",
    dbCategory: "IRRIGATION",
    desc: "Drip lines, sprinklers, and pumps for reliable watering",
    image: "https://images.unsplash.com/photo-1625246334831-d10f61e02a11?q=80&w=600&auto=format&fit=crop",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await api.get("/products?limit=8");
      return res.data?.products || res.data || [];
    },
  });

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[activeSlide];

  return (
    <div className="min-h-screen bg-[#FBF7EC] dark:bg-[#0B140D] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-body">
      {/* ============================================================
         HERO SECTION — furrow-row texture evokes plowed fields
         ============================================================ */}
      <section
        className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ambient furrow-line background */}
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, currentColor 0px, currentColor 2px, transparent 2px, transparent 42px)",
            color: "#3F6B3F",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-700/10 dark:bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-slate-800 border border-green-200 dark:border-slate-700 text-green-800 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                <GiWheat className="text-amber-500" />
                <span>{slide.eyebrow}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading leading-[1.15] text-slate-900 dark:text-white">
                {slide.headline}{" "}
                <span className="text-green-800 dark:text-amber-400 underline decoration-amber-500/40 decoration-4">
                  {slide.headlineAccent}
                </span>{" "}
                {slide.headlineTail}
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                {slide.body}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate(slide.cta.path)}
                  className="px-8 py-4 rounded-full bg-green-800 hover:bg-green-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-extrabold text-sm uppercase tracking-widest shadow-lg shadow-green-800/25 dark:shadow-amber-500/25 transition-all flex items-center gap-3 group"
                >
                  <span>{slide.cta.label}</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/shop")}
                  className="px-8 py-4 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-green-700 dark:hover:border-amber-400 text-slate-800 dark:text-slate-200 font-bold text-sm uppercase tracking-widest shadow-sm transition-all"
                >
                  View All Inputs
                </button>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeSlide
                          ? "w-8 bg-green-800 dark:bg-amber-500"
                          : "w-2.5 bg-slate-300 dark:bg-slate-700"
                        }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={prevSlide}
                    className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Slide Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 h-[420px] sm:h-[480px]">
                <img
                  src={slide.image}
                  alt={slide.headline}
                  className="w-full h-full object-cover transition-all duration-700 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 text-left">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
                    <GiPlantSeed className="text-amber-500" />
                    <span>Fresh This Season</span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Verified Suppliers, Fair Prices
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
         VALUE PROPS STRIP
         ============================================================ */}
      <section className="py-12 bg-white dark:bg-[#0F1C12] border-y border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FiTruck className="text-2xl text-green-700 dark:text-amber-400" />,
                title: "Nationwide Farm Delivery",
                desc: "Inputs shipped door-to-door across every region",
              },
              {
                icon: <FiShield className="text-2xl text-green-700 dark:text-amber-400" />,
                title: "Verified Suppliers",
                desc: "Every listing checked for authenticity and quality",
              },
              {
                icon: <FiSmartphone className="text-2xl text-green-700 dark:text-amber-400" />,
                title: "Instant Mobile Pay",
                desc: "EVC Plus, Zaad, Sahal & card payments accepted",
              },
              {
                icon: <FiHeadphones className="text-2xl text-green-700 dark:text-amber-400" />,
                title: "24/7 Farmer Support",
                desc: "Real help with orders, delivery and disputes",
              },
            ].map((prop, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-green-50/60 dark:hover:bg-slate-800/40 transition-colors text-left">
                <div className="p-3 rounded-2xl bg-green-50 dark:bg-slate-800 border border-green-100 dark:border-slate-700 shrink-0">
                  {prop.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {prop.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                    {prop.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
         CATEGORIES SECTION
         ============================================================ */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-green-700 dark:text-amber-400 block mb-2">
                Shop by Input
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
                Explore Top Categories
              </h2>
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-green-800 dark:text-amber-400 hover:underline"
            >
              <span>View All Categories</span>
              <FiArrowUpRight />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <div
                key={i}
                onClick={() => navigate(`/shop?category=${cat.dbCategory}`)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800 h-80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <h3 className="text-xl font-extrabold font-heading group-hover:text-amber-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 pt-2">
                    Browse Category <FiArrowRight />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
         FEATURED PRODUCTS
         ============================================================ */}
      <section className="py-20 bg-white dark:bg-[#0F1C12] border-t border-slate-200/80 dark:border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-green-700 dark:text-amber-400 block mb-2">
                Handpicked for This Season
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
                Featured Inputs
              </h2>
            </div>
            <button
              onClick={() => navigate("/shop")}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-green-800 dark:text-amber-400 hover:underline"
            >
              <span>Explore Entire Marketplace</span>
              <FiArrowUpRight />
            </button>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-[#FBF7EC] dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-green-600/50 dark:hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl text-left flex flex-col justify-between"
                >
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-60 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.images?.[0] || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&auto=format"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-800 dark:bg-amber-500 text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                        {product.category}
                      </span>
                    </div>

                    <div className="p-6 space-y-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
                        {product.description || "Quality agricultural input sourced from verified suppliers."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between">
                    <span className="text-xl font-black text-slate-900 dark:text-amber-400">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => {
                        addItem(product);
                        toast.success(`${product.name} added to cart`);
                      }}
                      className="px-4 py-2.5 rounded-full bg-green-800 hover:bg-green-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
         GOLD/GREEN CTA BANNER
         ============================================================ */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-green-900 via-green-800 to-amber-900 text-white">
        <div className="container mx-auto px-6 relative z-10 text-center space-y-6 max-w-3xl">
          <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-widest inline-block">
            Plant Smarter, Sell Faster
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-heading leading-tight">
            Ready to Grow Your Farm's Potential?
          </h2>
          <p className="text-green-100 text-base sm:text-lg leading-relaxed">
            Join thousands of farmers sourcing seeds, fertilizers and tools from verified suppliers — with instant mobile money checkout and nationwide delivery.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate("/shop")}
              className="px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
            >
              Start Shopping Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}