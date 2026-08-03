import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FiSearch, FiSliders, FiX, FiArrowRight, FiStar, FiShield } from "react-icons/fi";
import { GiWheat } from "react-icons/gi";
import api from "../lib/api";
import useCartStore from "../store/useCartStore";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const HERO_CARDS = [
  {
    tag: "Verified suppliers",
    title: "Inputs ready for the next planting cycle",
    copy: "Browse by crop stage, compare quality, and move faster from search to checkout.",
  },
  {
    tag: "Season stock",
    title: "Earth-toned marketplace with cleaner hierarchy",
    copy: "A matching look and feel with the new home, admin, supplier, and mobile redesigns.",
  },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "ALL");
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice") || 2000));
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((prev) => (prev + 1) % HERO_CARDS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (searchQuery) next.set("search", searchQuery);
    else next.delete("search");
    if (selectedCategory && selectedCategory !== "ALL") next.set("category", selectedCategory);
    else next.delete("category");
    next.set("maxPrice", String(maxPrice));
    setSearchParams(next, { replace: true });
  }, [searchQuery, selectedCategory, maxPrice, searchParams, setSearchParams]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data?.products || res.data || [];
    },
  });

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory = selectedCategory === "ALL" || product.category === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = Number(product.price) <= Number(maxPrice);
        return matchesCategory && matchesSearch && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy]);

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="shop-page min-h-screen pt-28 pb-16">
      <div className="page-shell space-y-8">
        <section className="hero-panel p-5 sm:p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5 text-left text-white">
              <span className="section-eyebrow border-white/20 bg-white/10 text-white">
                <FiShield />
                Marketplace
              </span>
              <h1 className="page-hero__title text-white">
                {HERO_CARDS[heroIndex].title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/78">
                {HERO_CARDS[heroIndex].copy}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="brand-pill border-white/15 bg-white/10 text-white/80">
                  <FiStar />
                  {HERO_CARDS[heroIndex].tag}
                </span>
                <button
                  onClick={() => navigate("/checkout")}
                  className="inline-flex items-center gap-3 rounded-full bg-[color:var(--accent)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#111] transition hover:bg-[color:var(--accent-hover)]"
                >
                  Continue to checkout
                  <FiArrowRight />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="feature-card bg-white/92">
                <div className="feature-card__label">Live catalog</div>
                <div className="feature-card__value">{products.length.toLocaleString()}</div>
                <p className="surface-note mt-2">Products loaded from the API in a calmer, premium presentation.</p>
              </div>
              <div className="feature-card bg-white/92">
                <div className="feature-card__label">Search style</div>
                <div className="feature-card__value">Refined</div>
                <p className="surface-note mt-2">Search, filter, and sort controls wrapped in soft glass panels.</p>
              </div>
              <div className="feature-card bg-white/92 sm:col-span-2">
                <div className="feature-card__label">Season note</div>
                <div className="feature-card__value">Made to feel like the reference designs</div>
                <p className="surface-note mt-2">
                  Warm palette, strong framing, and rounded cards with more editorial spacing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="control-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search seeds, fertilizers, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[color:var(--border-color)] bg-white px-12 py-3.5 text-sm text-[color:var(--text-main)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-2xl border border-[color:var(--border-color)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--text-main)] outline-none"
              >
                <option value="newest">Sort by newest</option>
                <option value="price-low">Price low to high</option>
                <option value="price-high">Price high to low</option>
              </select>

              <button
                onClick={() => setIsFilterOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border-color)] bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--text-main)] lg:hidden"
              >
                {isFilterOpen ? <FiX /> : <FiSliders />}
                Filters
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto border-t border-[color:var(--border-color)] pt-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition ${
                  selectedCategory === category
                    ? "bg-[color:var(--primary)] text-white"
                    : "bg-[color:var(--surface-soft)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]"
                }`}
              >
                {category === "ALL" && <GiWheat className="mr-1 inline-block" />}
                {category}
              </button>
            ))}
          </div>

          {isFilterOpen && (
            <div className="mt-4 rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4 lg:hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                  Price ceiling
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--primary)]">
                  ${maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-3 w-full accent-[color:var(--primary)]"
              />
            </div>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr]">
          <aside className="hidden space-y-6 lg:block">
            <div className="dashboard-panel text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[color:var(--text-main)]">Filters</h3>
                <button
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSearchQuery("");
                    setMaxPrice(2000);
                  }}
                  className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--accent)]"
                >
                  Reset
                </button>
              </div>
              <div className="dashboard-divider my-4" />
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    <span>Max price</span>
                    <span className="text-[color:var(--primary)]">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[color:var(--primary)]"
                  />
                </div>

                <div className="rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
                    Active results
                  </div>
                  <div className="mt-2 text-3xl font-black text-[color:var(--text-main)]">
                    {filteredProducts.length}
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    Matching your chosen categories, search, and price limit.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-5 text-left">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="brand-kpi h-[380px] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onNavigate={(id) => navigate(`/product/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="dashboard-panel text-center">
                <p className="text-lg font-black text-[color:var(--text-main)]">No products matched your filters</p>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Try a broader category or lower your price limit.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
