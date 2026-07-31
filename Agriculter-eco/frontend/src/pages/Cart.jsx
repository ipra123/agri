import { Link } from "react-router-dom";
import useCartStore from "../store/useCartStore";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiShield, FiTruck } from "react-icons/fi";

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center pt-20 px-6 font-body transition-colors">
        <div className="w-24 h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-4xl mb-6 text-slate-400 dark:text-slate-500 shadow-md">
          <FiShoppingBag />
        </div>
        <h2 className="text-3xl font-black font-heading mb-3">Your Cart is Empty</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-8 leading-relaxed text-sm">
          Explore our exclusive catalog of luxury decor, furniture, and artisanal crafts.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black rounded-full transition-all text-xs uppercase tracking-widest shadow-lg shadow-blue-700/20 dark:shadow-amber-500/20"
        >
          <span>Start Shopping Now</span>
          <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0a0f1d] min-h-screen text-slate-900 dark:text-slate-100 pt-28 pb-20 font-body transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-6xl text-left">
        <div className="flex items-baseline gap-3 mb-8">
          <h1 className="text-3xl font-black font-heading">Shopping Cart</h1>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-bold">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Item List */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                <Link
                  to={`/product/${item.id}`}
                  className="w-full sm:w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                >
                  <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-amber-400 font-extrabold block">
                      {item.category || "Decor"}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{item.name}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold pt-1">
                      <FiTruck /> Express Shipping Available
                    </p>
                    <button
                      className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-bold pt-2"
                      onClick={() => removeItem(item.id)}
                    >
                      <FiTrash2 /> Remove Item
                    </button>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                    <span className="text-xl font-black text-slate-900 dark:text-amber-400">${item.price}</span>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-bold"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-bold"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/shop"
              className="p-5 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 transition-colors text-xs font-extrabold uppercase tracking-widest bg-slate-50 dark:bg-slate-900/40"
            >
              + Continue Shopping
            </Link>
          </div>

          {/* Summary Card */}
          <div className="lg:sticky lg:top-28 bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white font-extrabold">${getTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-sm">
                <span className="font-extrabold text-slate-900 dark:text-white">Total</span>
                <span className="text-xl font-black text-blue-700 dark:text-amber-400">${getTotal()}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-700/20 dark:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <FiArrowRight />
            </Link>

            <div className="flex items-center gap-2 justify-center text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <FiShield className="text-amber-500 text-xs" /> 100% Encrypted & Safe Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;