import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FiShoppingBag, FiArrowLeft, FiTruck, FiShield, FiRotateCcw, FiStar } from "react-icons/fi";
import api from "../lib/api";
import useCartStore from "../store/useCartStore";
import Reviews from "../components/Reviews";
import toast from "react-hot-toast";
import { resolveMediaUrl } from "../lib/media";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCartStore();
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] flex flex-col items-center justify-center space-y-6 text-slate-900 dark:text-white">
        <h2 className="text-3xl font-extrabold font-heading">Product Not Found</h2>
        <Link
          to="/shop"
          className="px-6 py-3 rounded-full bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider"
        >
          Back to Shop
        </Link>
      </div>
    );

  return (
    <div className="bg-slate-50 dark:bg-[#0a0f1d] min-h-screen text-slate-900 dark:text-slate-100 pt-28 pb-20 font-body transition-colors duration-300">
      <div className="container mx-auto px-6">
        {/* Back Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 mb-8 transition-colors uppercase text-xs font-bold tracking-widest"
        >
          <FiArrowLeft /> Back to Collection
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start text-left">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xl">
              <img
                src={resolveMediaUrl(product.images?.[activeImg] || product.images?.[0])}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl transition-all duration-500"
              />
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider rounded-full shadow-md">
                Verified Quality
              </div>
            </div>

            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border transition-all duration-300 ${
                      activeImg === idx
                        ? "border-2 border-blue-600 dark:border-amber-400 scale-105 shadow-md"
                        : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={resolveMediaUrl(img)} alt={product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-blue-600 dark:text-amber-400 font-extrabold uppercase tracking-widest text-xs">
                <span className="w-6 h-[2px] bg-amber-500" />
                {product.category || "Luxury Decor"}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-6 pt-2">
                <span className="text-3xl font-black text-slate-900 dark:text-amber-400">
                  ${product.price}
                </span>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                <span
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    product.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              {product.description ||
                "Exquisitely crafted luxury centerpiece created with modern aesthetics and premium durability. Ideal for living rooms, executive suites, and dining areas."}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                  >
                    -
                  </button>
                  <span className="px-5 font-black text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 px-8 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-700/20 dark:shadow-amber-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-400"
                >
                  <FiShoppingBag className="text-base" />
                  <span>Add {quantity} to Cart</span>
                </button>
              </div>
            </div>

            {/* Product Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
              <div className="flex flex-col items-center text-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FiTruck className="text-xl text-blue-600 dark:text-amber-400" />
                <span className="font-bold">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FiShield className="text-xl text-blue-600 dark:text-amber-400" />
                <span className="font-bold">Authentic Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FiRotateCcw className="text-xl text-blue-600 dark:text-amber-400" />
                <span className="font-bold">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Component */}
        <div className="mt-20">
          <Reviews productId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
