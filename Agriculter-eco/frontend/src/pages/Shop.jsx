import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiSliders,
  FiX,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiArrowRight
} from "react-icons/fi";
import { GiWheat } from "react-icons/gi";
import api from "../lib/api";
import useCartStore from "../store/useCartStore";
import toast from "react-hot-toast";

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600&auto=format&fit=crop",
    tag: "Verified Suppliers",
    title: "This Season's Agricultural Inputs",
    copy: "Seeds, fertilizers, pesticides, tools and irrigation equipment from checked suppliers, delivered straight to your farm.",
  },
  {
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1600&auto=format&fit=crop",
    tag: "New Stock",
    title: "Certified Seeds & Fertilizers",
    copy: "Compare prices, read farmer reviews, and pay instantly with mobile money at checkout.",
  },
];

function ShopProductCard({ product, onAddToCart, onNavigate }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-green-600/50 dark:hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between">
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onNavigate(product.id)}>
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            No Image
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-green-800 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-green-200 dark:border-slate-700 shadow-sm">
          {product.category}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-3">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            {product.supplier?.supplierBusinessName || "Verified Supplier"}
          </span>
          <h3
            onClick={() => onNavigate(product.id)}
            className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 hover:text-green-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-base font-black text-slate-900 dark:text-amber-400">${product.price}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="w-9 h-9 rounded-xl bg-green-800 hover:bg-green-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 flex items-center justify-center transition-all active:scale-95 shadow-md"
            aria-label={`Add ${product.name} to cart`}
          >
            <FiShoppingBag className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "ALL");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || 2000);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/products");
      return res.data?.products || res.data || [];
    },
  });

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
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

  const handleNavigate = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#FBF7EC] dark:bg-[#0B140D] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-body pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-8 md:p-12 mb-12 shadow-xl">
          <img
            src={HERO_SLIDES[heroIndex].image}
            alt="Shop Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 scale-105"
          />
          <div className="relative z-10 max-w-xl text-left space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest inline-block shadow-md">
              {HERO_SLIDES[heroIndex].tag}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-heading leading-tight">
              {HERO_SLIDES[heroIndex].title}
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {HERO_SLIDES[heroIndex].copy}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-[#0F1C12] rounded-2xl p-4 md:p-6 border border-slate-200/80 dark:border-slate-800 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search seeds, fertilizers, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#FBF7EC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-green-700 dark:focus:border-amber-400"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-[#FBF7EC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider focus:outline-none"
              >
                <option value="newest">Sort by Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="md:hidden px-4 py-3 bg-green-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <FiSliders /> Filters
              </button>
            </div>
          </div>

          {/* Categories Pill Horizontal List */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${selectedCategory === cat
                  ? "bg-green-800 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                {cat === "ALL" && <GiWheat className="text-sm" />}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid & Layout */}
        <div className="grid lg:grid-cols-4 gap-8 text-left">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6 bg-white dark:bg-[#0F1C12] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 h-fit shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                Filter Inputs
              </h3>
              {(selectedCategory !== "ALL" || searchQuery || maxPrice < 2000) && (
                <button
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSearchQuery("");
                    setMaxPrice(2000);
                  }}
                  className="text-[11px] font-bold text-amber-500 hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Max Price Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Max Price:</span>
                <span className="text-green-800 dark:text-amber-400 font-extrabold">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="10"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-green-800 dark:accent-amber-500"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#0F1C12] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <FiShoppingBag className="text-4xl text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No inputs found</h3>
                <p className="text-slate-500 text-xs">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}