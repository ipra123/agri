import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useCartStore from "../store/useCartStore";
import api from "../lib/api";
import toast from "react-hot-toast";
import {
  FiArrowLeft, FiShield, FiLock, FiSmartphone,
  FiMapPin, FiAlertCircle, FiCheckCircle, FiTag, FiShoppingBag
} from "react-icons/fi";

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore();
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("Banaadir");
  const [paymentMethod, setPaymentMethod] = useState("EVC Plus");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [waafiErrorResponse, setWaafiErrorResponse] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!phoneNumber) {
      toast.error("Please enter your Mobile Money phone number");
      return;
    }

    setIsProcessing(true);
    setWaafiErrorResponse(null);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: `${region} Region: ${address}`,
        totalAmount: getTotal(),
        paymentMethod,
        last4Digits: phoneNumber,
        comment: `Farm order via ${paymentMethod} (${phoneNumber})`,
        couponCode: couponCode || undefined,
      };

      const { data } = await api.post("/orders", orderData);
      toast.success("Agricultural order placed successfully!");
      clearCart();
      navigate(`/order/${data.id}`);
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData?.error === "PAYMENT_FAILED" && responseData?.waafiResponse) {
        setWaafiErrorResponse(responseData.waafiResponse);
        toast.error(responseData.message || "Mobile payment failed");
      } else {
        toast.error(error.response?.data?.message || "Checkout failed. Please check backend connection.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center space-y-6 pt-20 px-6 font-body">
        <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-3xl text-slate-400">
          <FiShoppingBag />
        </div>
        <h2 className="text-3xl font-black font-heading">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-sm text-center">Add seeds, fertilizers, or farm tools to proceed with checkout.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 text-white dark:text-slate-950 font-black rounded-full transition-all text-xs uppercase tracking-widest"
        >
          Explore Farm Market
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0a0f1d] min-h-screen text-slate-900 dark:text-slate-100 pt-28 pb-20 font-body transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-6xl text-left">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-amber-400 mb-8 transition-colors uppercase text-xs font-bold tracking-widest"
        >
          <FiArrowLeft /> Back to Cart
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">Checkout</h1>
              <span className="text-emerald-700 dark:text-amber-400 font-extrabold uppercase tracking-widest text-[10px] flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-emerald-200 dark:border-slate-700">
                <FiLock className="text-xs" /> Secure Mobile Payment
              </span>
            </div>

            {waafiErrorResponse && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <FiAlertCircle className="text-base" /> Mobile Payment Processing Error
                </div>
                <p>{waafiErrorResponse.responseMsg || "Please verify your mobile number and available balance."}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-amber-400 font-bold">
                    <FiMapPin className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      1. Farm Delivery Location
                    </h3>
                    <p className="text-xs text-slate-400">Specify district or farm region for logistics dispatch</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Region / State
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Banaadir">Banaadir (Mogadishu)</option>
                      <option value="Shabeellaha Hoose">Shabeellaha Hoose (Afgooye / Marka)</option>
                      <option value="Shabeellaha Dhexe">Shabeellaha Dhexe (Jowhar)</option>
                      <option value="Hiiraan">Hiiraan (Beledweyne)</option>
                      <option value="Bay">Bay (Baidoa)</option>
                      <option value="Jubbada Hoose">Jubbada Hoose (Kismayo)</option>
                      <option value="Puntland">Puntland (Bosaso / Garowe)</option>
                      <option value="Somaliland">Somaliland (Hargeisa / Burao)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Farm / Village Address
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Afgooye Road, Block 4 Farm"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Money Payment Method */}
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-5 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-amber-400 font-bold">
                    <FiSmartphone className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      2. Mobile Money Payment (Instant API)
                    </h3>
                    <p className="text-xs text-slate-400">Select payment provider and enter mobile number</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "EVC Plus", label: "EVC Plus", sub: "Hormuud" },
                    { id: "Zaad", label: "Zaad Service", sub: "Telesom" },
                    { id: "Sahal", label: "Sahal Pay", sub: "Golis" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        paymentMethod === method.id
                          ? "bg-emerald-600 dark:bg-amber-500 text-white dark:text-slate-950 border-transparent shadow-md font-black"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                      }`}
                    >
                      <span className="block text-xs uppercase tracking-wider">{method.label}</span>
                      <span className="text-[10px] opacity-75">{method.sub}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Mobile Phone Number (for PIN Prompt)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 615000000 or 634000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">You will receive an automated USSD prompt on your phone to confirm PIN payment.</p>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <FiTag className="text-amber-500" /> Coupon / Bulk Discount Code
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="ENTER COUPON CODE (e.g. GU2026)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white uppercase font-bold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all disabled:bg-slate-400"
              >
                {isProcessing ? "Processing Mobile Payment..." : `Pay $${getTotal()} via ${paymentMethod}`}
              </button>
            </form>
          </div>

          {/* Right Order Summary */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-base font-black font-heading text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
              Order Items Summary
            </h3>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.images?.[0]} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                    <p className="text-slate-400">{item.quantity} x ${item.price}</p>
                  </div>
                  <span className="font-black text-xs text-slate-900 dark:text-amber-400">${item.quantity * item.price}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white">${getTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Logistics Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-base">
                <span className="font-black text-slate-900 dark:text-white">Total Due</span>
                <span className="font-black text-emerald-600 dark:text-amber-400">${getTotal()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-slate-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-2">
              <FiCheckCircle className="text-sm shrink-0" />
              <span>Verified Agrovet Supplier Guarantee Included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;