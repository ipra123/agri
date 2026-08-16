import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiSliders,
  FiX,
  FiDroplet,
  FiAlertTriangle,
  FiTool,
} from "react-icons/fi";
import { GiWheat, GiWateringCan, GiCow } from "react-icons/gi";
import api from "../lib/api";
import useCartStore from "../store/useCartStore";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const PAGE_SIZE = 9;

const CATEGORY_ICONS = {
  Seeds: GiWheat,
  Fertilizers: FiDroplet,
  Pesticides: FiAlertTriangle,
  Tools: FiTool,
  Irrigation: GiWateringCan,
  Feed: GiCow,
};

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-sm text-white/70">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-white/15"
          }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"
            }`}
        />
      </span>
    </button>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "ALL");
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get("maxPrice") || 2000));
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useMemo(() => {
    const next = new URLSearchParams(searchParams);
    if (searchQuery) next.set("search", searchQuery);
    else next.delete("search");
    if (selectedCategory && selectedCategory !== "ALL") next.set("category", selectedCategory);
    else next.delete("category");
    next.set("maxPrice", String(maxPrice));
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, maxPrice]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data?.products || res.data || [];
    },
  });

  const categories = useMemo(() => {
    const set = new Set(products.map((product) => product.category).filter(Boolean));
    return Array.from(set);
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
        // NOTE: `isVerified` / `inStock` are assumed field names — treat as
        // passing when the field is absent so this doesn't hide products
        // until the API actually returns these flags. Update the field
        // names below once confirmed.
        const matchesVerified = !verifiedOnly || product.isVerified !== false;
        const matchesInStock = !inStockOnly || product.inStock !== false;
        return matchesCategory && matchesSearch && matchesPrice && matchesVerified && matchesInStock;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy, verifiedOnly, inStockOnly]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const resetFilters = () => {
    setSelectedCategory("ALL");
    setSearchQuery("");
    setMaxPrice(2000);
    setVerifiedOnly(false);
    setInStockOnly(false);
  };

  return (
    <div className="shop-page min-h-screen bg-[#071209] pt-28 pb-16 text-white">
      {/* Department sub-nav */}
      <nav className="mb-8 border-y border-white/5 bg-[#0a1911]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-8 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category] || GiWheat;
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(active ? "ALL" : category)}
                className={`flex flex-shrink-0 flex-col items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide transition-colors ${active ? "text-emerald-400" : "text-white/50 hover:text-white/80"
                  }`}
              >
                <Icon className="text-lg" />
                {category}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Search + sort */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-[#0d1f16] px-12 py-3.5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-emerald-500/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-white/10 bg-[#0d1f16] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white outline-none"
            >
              <option value="newest">Recommended</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>

            <button
              onClick={() => setIsFilterOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d1f16] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white lg:hidden"
            >
              {isFilterOpen ? <FiX /> : <FiSliders />}
              Filters
            </button>
          </div>
        </div>

        {/* Mobile filter drawer */}
        {isFilterOpen && (
          <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0d1f16] p-4 lg:hidden">
            <FiltersPanel
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              resultCount={filteredProducts.length}
              onReset={resetFilters}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:space-y-5">
            <FiltersPanel
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              resultCount={filteredProducts.length}
              onReset={resetFilters}
            />
          </aside>

          {/* Product grid */}
          <section className="space-y-8 text-left">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[380px] animate-pulse rounded-3xl bg-white/5" />
                ))}
              </div>
            ) : visibleProducts.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onNavigate={(id) => navigate(`/product/${id}`)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                      className="rounded-full border border-emerald-500/40 px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-400 transition hover:bg-emerald-500/10"
                    >
                      Load more inputs
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-[#0d1f16] p-10 text-center">
                <p className="text-lg font-black text-white">No products matched your filters</p>
                <p className="mt-2 text-sm text-white/50">
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

function FiltersPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  maxPrice,
  setMaxPrice,
  verifiedOnly,
  setVerifiedOnly,
  inStockOnly,
  setInStockOnly,
  resultCount,
  onReset,
}) {
  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-[#0d1f16] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">Filters</h3>
          <button onClick={onReset} className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-400">
            Reset
          </button>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">Active results</div>
          <div className="mt-1 text-3xl font-black text-white">{resultCount}</div>
          <p className="mt-2 text-sm text-white/50">
            Matching your chosen categories, search, and price limit.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0d1f16] p-5">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
          <span>Max price</span>
          <span className="text-emerald-400">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-3 w-full accent-emerald-500"
        />
        <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-white/30">
          <span>$0</span>
          <span>$5000+</span>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-[#0d1f16] p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">Department</div>
          <div className="mt-3 space-y-3">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-3 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={selectedCategory === category}
                  onChange={() =>
                    setSelectedCategory(selectedCategory === category ? "ALL" : category)
                  }
                  className="h-4 w-4 rounded accent-emerald-500"
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-[#0d1f16] p-5">
        <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/50">Status</div>
        <div className="space-y-4">
          <ToggleSwitch checked={verifiedOnly} onChange={setVerifiedOnly} label="Verified Sellers Only" />
          <ToggleSwitch checked={inStockOnly} onChange={setInStockOnly} label="In Stock Ready" />
        </div>
      </div>
    </>
  );
}