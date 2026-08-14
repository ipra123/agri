import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader, FiBox, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { resolveMediaUrl } from "../../lib/media";

const AGRICULTURAL_CATEGORIES = [
  { value: "SEEDS", label: "Certified Seeds" },
  { value: "FERTILIZERS", label: "NPK & Organic Fertilizers" },
  { value: "PESTICIDES", label: "Pesticides & Crop Protection" },
  { value: "FARM_TOOLS", label: "Farm Tools & Machinery" },
  { value: "IRRIGATION_EQUIPMENT", label: "Solar Irrigation & Drip Kits" },
  { value: "ANIMAL_FEED", label: "Livestock & Animal Feed" },
  { value: "OTHER", label: "Other Agribusiness Inputs" },
];

const UNITS = ["bag", "kg", "liter", "kit", "piece", "pack", "ton"];

const SupplierProducts = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "SEEDS",
    stockQuantity: "",
    lowStockThreshold: "10",
    unit: "bag",
    images: []
  });

  const { data, isLoading } = useQuery({
    queryKey: ["supplier-products"],
    queryFn: async () => {
      const profileRes = await api.get("/auth/profile");
      const profile = profileRes.data;
      const productsRes = await api.get(`/products?supplierId=${profile.id}`);
      return { profile, products: productsRes.data };
    },
  });

  const isApproved = data?.profile?.verificationStatus === "APPROVED";

  const createMutation = useMutation({
    mutationFn: (newProduct) => api.post("/products", newProduct, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-products"]);
      toast.success("Farm input listing created!");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create input listing");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updatedData }) => api.put(`/products/${id}`, updatedData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-products"]);
      toast.success("Farm input listing updated!");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update input listing");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-products"]);
      toast.success("Farm input deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete input");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct && formData.images.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("description", formData.description);
    payload.append("price", formData.price);
    payload.append("stock", formData.stock);
    payload.append("stockQuantity", formData.stockQuantity || formData.stock);
    payload.append("lowStockThreshold", formData.lowStockThreshold || "10");
    payload.append("unit", formData.unit);
    payload.append("category", formData.category);
    payload.append("supplierId", data?.profile?.id);

    if (formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        payload.append("images", formData.images[i]);
      }
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, updatedData: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        category: product.category || "SEEDS",
        stockQuantity: product.stockQuantity || product.stock,
        lowStockThreshold: product.lowStockThreshold || "10",
        unit: product.unit || "bag",
        images: []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "SEEDS",
        stockQuantity: "",
        lowStockThreshold: "10",
        unit: "bag",
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8 text-left pb-16 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">
            My Farm Input Catalog
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your listed seeds, fertilizers, sprayers, and irrigation inventory.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center gap-2"
        >
          <FiPlus className="text-base" /> + Add New Farm Input
        </button>
      </div>

      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <FiAlertTriangle className="text-xl shrink-0" />
          <span>
            Your supplier profile is currently pending admin KYC approval. Once approved, your listed inputs will be visible to farmers nationwide.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <FiLoader className="text-3xl animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="p-4">Input Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {data?.products?.map((p) => {
                  const isLow = p.stock < (p.lowStockThreshold || 10);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={resolveMediaUrl(p.images?.[0]) || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&auto=format"}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-black uppercase">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-900 dark:text-amber-400 font-black">
                        ${p.price} <span className="text-[10px] text-slate-400">/ {p.unit}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isLow ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {p.stock} {p.unit}s {isLow && "(Low Stock)"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(p)}
                            className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(p.id)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-slate-800"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black font-heading text-slate-900 dark:text-white">
                {editingProduct ? "Edit Input Listing" : "Add Agricultural Input"}
              </h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Input Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. High-Yield Sorghum Seed 50kg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    {AGRICULTURAL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="35.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Description & Usage Guidelines
                </label>
                <textarea
                  rows="3"
                  placeholder="Germination percentage, dosage rate per hectare..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Product Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, images: e.target.files })}
                  required={!editingProduct}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.16em] file:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-md transition-all"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingProduct
                  ? "Update Listing"
                  : "Save Farm Input"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProducts;
