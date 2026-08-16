import { Link } from "react-router-dom";
import useCartStore from "../store/useCartStore";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiArrowRight,
  FiShield,
  FiTruck,
  FiSmartphone,
  FiChevronRight,
} from "react-icons/fi";
import { resolveMediaUrl } from "../lib/media";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#071209] text-slate-900 dark:text-white flex flex-col items-center justify-center pt-20 px-6 font-body transition-colors">
        <div className="w-24 h-24 bg-white dark:bg-[#0d1f16] border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-400 dark:text-white/40 shadow-md dark:shadow-none">
          <FiShoppingBag />
        </div>
        <h2 className="text-3xl font-black font-heading mb-3">Your Cart is Empty</h2>
        <p className="text-slate-500 dark:text-white/50 max-w-md text-center mb-8 leading-relaxed text-sm">
          Explore our marketplace of certified seeds, fertilizers, tools, and other agricultural inputs.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-[#0a1f12] font-black rounded-full transition-all text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/20"
        >
          <span>Start Shopping Now</span>
          <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#071209] min-h-screen text-slate-900 dark:text-white pt-28 pb-20 font-body transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-6xl text-left">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-bold mb-4 text-slate-500 dark:text-white/40">
          <Link to="/shop" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Marketplace
          </Link>
          <FiChevronRight className="text-slate-300 dark:text-white/20" />
          <span className="text-slate-900 dark:text-white">Shopping Cart</span>
        </div>

        <h1 className="text-3xl font-black font-heading mb-2">Your Cart</h1>
        <p className="text-sm text-slate-500 dark:text-white/50 mb-8">
          Review your agricultural inputs before checkout.
        </p>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Item List */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0d1f16] border border-slate-200/80 dark:border-white/10 rounded-3xl divide-y divide-slate-100 dark:divide-white/10 shadow-sm dark:shadow-none overflow-hidden">
            {items.map((item) => {
              const extendedPrice = (item.price * item.quantity).toFixed(2);
              const unit = item.unit || "unit";
              return (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 relative">
                  <Link
                    to={`/product/${item.id}`}
                    className="relative w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0 border border-slate-200 dark:border-white/10"
                  >
                    <img src={resolveMediaUrl(item.images?.[0])} alt={item.name} className="w-full h-full object-cover" />
                    {item.stockLabel && (
                      <span className="absolute top-1.5 left-1.5 rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#1a1200]">
                        {item.stockLabel}
                      </span>
                    )}
                  </Link>

                  <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-extrabold block">
                        {item.category || "Farm Input"}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-white/50 max-w-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full p-1 w-fit mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors text-slate-700 dark:text-white/70 font-bold"
                        >
                          <FiMinus className="text-xs" />
                        </button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors text-slate-700 dark:text-white/70 font-bold"
                        >
                          <FiPlus className="text-xs" />
                        </button>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <button
                        className="text-slate-400 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 transition-colors"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900 dark:text-emerald-400 block">
                          ${extendedPrice}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-white/40">
                          ${Number(item.price).toFixed(2)} / {unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              to="/shop"
              className="p-5 flex items-center justify-center gap-2 text-slate-500 dark:text-white/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-xs font-extrabold uppercase tracking-widest bg-slate-50 dark:bg-white/5"
            >
              + Continue Shopping
            </Link>
          </div>

          {/* Summary Card */}
          <div className="lg:sticky lg:top-28 bg-white dark:bg-[#0d1f16] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-6 shadow-sm dark:shadow-none">
            <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs font-bold text-slate-600 dark:text-white/50">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span className="text-slate-900 dark:text-white font-extrabold">${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span className="text-slate-500 dark:text-white/40 font-extrabold">Calculated at checkout</span>
              </div>
              <div className="border-t border-slate-100 dark:border-white/10 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-extrabold text-slate-900 dark:text-white">Total</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-right text-[9px] uppercase tracking-wide text-slate-400 dark:text-white/30 mt-1">
                  Includes applicable discounts
                </p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-[#0a1f12] font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight />
            </Link>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">
                <FiShield className="text-emerald-600 dark:text-emerald-400 text-xs" /> 100% Secure Checkout
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">
                <FiSmartphone className="text-emerald-600 dark:text-emerald-400 text-xs" /> Mobile Money Ready
              </div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-bold">
                <FiTruck className="text-emerald-600 dark:text-emerald-400 text-xs" /> Nationwide Farm Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;