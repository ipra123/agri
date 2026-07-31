import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader, FiPackage, FiImage, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

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

const AdminProducts = () => {
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
    supplierId: "",
    images: []
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    }
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users-for-products"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Farm input created successfully!");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create farm input.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Farm input updated!");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update product.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Farm input deleted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete input")
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("stockQuantity", formData.stockQuantity || formData.stock);
    data.append("lowStockThreshold", formData.lowStockThreshold || "10");
    data.append("unit", formData.unit);
    data.append("category", formData.category);
    if (formData.supplierId) {
      data.append("supplierId", formData.supplierId);
    }

    if (formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        data.append("images", formData.images[i]);
      }
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
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
        supplierId: product.supplierId || "",
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
        supplierId: "",
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const suppliers = users?.filter(u => u.role === "SUPPLIER") || [];

  return (
    <div className="space-y-8 text-left pb-16 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">
            Agricultural Input Catalog
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage certified seeds, fertilizers, pesticides, tools, and irrigation stock.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center gap-2"
        >
          <FiPlus className="text-base" /> Add Farm Input
        </button>
      </div>

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
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold">
                {products?.map((p) => {
                  const isLow = p.stock < (p.lowStockThreshold || 10);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100&auto=format"}
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
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {p.supplier?.supplierBusinessName || p.supplier?.name || "Market Supplier"}
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
                {editingProduct ? "Edit Farm Input" : "Add New Agricultural Input"}
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
                  placeholder="e.g. Certified Hybrid Maize Seeds"
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
                    placeholder="25.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Low Stock Threshold
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
                  Agrovet Supplier
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Platform Default Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierBusinessName || s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Description & Specifications
                </label>
                <textarea
                  rows="3"
                  placeholder="Germination rate, NPK ratio, dosage recommendations..."
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
                  onChange={(e) => setFormData({ ...formData, images: e.target.files })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-widest shadow-md transition-all"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving Input..."
                  : editingProduct
                  ? "Update Product"
                  : "Save Farm Input"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;