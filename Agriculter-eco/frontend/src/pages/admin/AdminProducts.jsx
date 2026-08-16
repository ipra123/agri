import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { FiX, FiLoader, FiSliders } from "react-icons/fi";
import { resolveMediaUrl } from "../../lib/media";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const AGRICULTURAL_CATEGORIES = [
  { value: "SEEDS", label: "Certified Seeds" },
  { value: "FERTILIZERS", label: "NPK & Organic Fertilizers" },
  { value: "PESTICIDES", label: "Pesticides & Crop Protection" },
  { value: "FARM_TOOLS", label: "Farm Tools & Machinery" },
  { value: "IRRIGATION_EQUIPMENT", label: "Solar Irrigation & Drip Kits" },
  { value: "ANIMAL_FEED", label: "Livestock & Animal Feed" },
  { value: "OTHER", label: "Other Agribusiness Inputs" },
];

const DEFAULT_LOW_STOCK_THRESHOLD = "10";

const UNITS = ["bag", "kg", "liter", "kit", "piece", "pack", "ton"];

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const categoryLabel = (value) => AGRICULTURAL_CATEGORIES.find((c) => c.value === value)?.label || value;

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "SEEDS",
    stockQuantity: "",
    unit: "bag",
    supplierId: "",
    images: [],
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ["admin-users-for-products"],
    queryFn: async () => {
      const { data } = await api.get("/admin/users");
      return data;
    },
  });

  // ---- Chart data ----
  const categoryChartData = useMemo(() => {
    if (!products?.length) return [];
    const map = {};
    products.forEach((p) => {
      const label = categoryLabel(p.category);
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [products]);

  const stockChartData = useMemo(() => {
    if (!products?.length) return [];
    const map = {};
    products.forEach((p) => {
      const label = categoryLabel(p.category);
      map[label] = (map[label] || 0) + (parseInt(p.stock) || 0);
    });
    return Object.entries(map).map(([name, stock]) => ({ name, stock }));
  }, [products]);

  const createMutation = useMutation({
    mutationFn: (data) =>
      api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Farm input created successfully!");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create farm input.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Farm input updated!");
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update product.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Farm input deleted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete input"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct && formData.images.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("stockQuantity", formData.stockQuantity || formData.stock);
    data.append("lowStockThreshold", DEFAULT_LOW_STOCK_THRESHOLD);
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
        unit: product.unit || "bag",
        supplierId: product.supplierId || "",
        images: [],
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
        unit: "bag",
        supplierId: "",
        images: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const suppliers = users?.filter((u) => u.role === "SUPPLIER") || [];

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  return (
    <div className="space-y-8 text-left pb-16 transition-colors duration-300">
      {/* Toolbar: search + filter + add button — square, borderless, shadow-defined */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-[color:var(--bg-card-solid)] p-3 shadow-md">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search farm inputs by name..."
            className="w-full bg-[color:var(--surface-soft)] pl-11 pr-4 py-3 text-xs font-bold text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] placeholder:font-medium focus:outline-none"
          />
        </div>

        <div className="relative w-full lg:w-64">
          <FiSliders className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] text-base pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none bg-[color:var(--surface-soft)] pl-11 pr-4 py-3 text-xs font-bold text-[color:var(--text-main)] focus:outline-none"
          >
            <option value="ALL" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
              All Categories
            </option>
            {AGRICULTURAL_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => openModal()}
          className="px-6 py-3 bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] text-white font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          ➕ Add Input
        </button>
      </div>

      {/* ===== Analytics: category split + stock levels ===== */}
      {!isLoading && products?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[color:var(--bg-card-solid)] p-6 shadow-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--text-main)] mb-4 flex items-center gap-2">
              📊 Catalog Mix by Category
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[color:var(--bg-card-solid)] p-6 shadow-md">
            <h3 className="text-sm font-black uppercase tracking-widest text-[color:var(--text-main)] mb-4 flex items-center gap-2">
              📦 Stock Volume by Category
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="stock" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ===== Product grid — shop-style cards, no rows/columns table ===== */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-[color:var(--text-muted)]">
          <FiLoader className="text-3xl animate-spin text-[color:var(--primary)]" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[color:var(--bg-card-solid)] p-20 text-center text-[color:var(--text-muted)] italic shadow-md">
          🌱 No farm inputs match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group relative bg-[color:var(--bg-card-solid)] shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-[color:var(--surface-soft)]">
                <img
                  src={
                    resolveMediaUrl(p.images?.[0]) ||
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format"
                  }
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-[color:var(--primary)] text-white text-[9px] font-black uppercase px-2.5 py-1 tracking-wider">
                  {categoryLabel(p.category)}
                </span>

                {/* Hover actions */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => openModal(p)}
                    title="Edit"
                    className="w-8 h-8 flex items-center justify-center bg-white/95 text-blue-600 shadow-md hover:bg-white text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(p.id)}
                    title="Delete"
                    className="w-8 h-8 flex items-center justify-center bg-white/95 text-red-600 shadow-md hover:bg-white text-sm"
                  >
                    🗑️
                  </button>
                </div>

                {parseInt(p.stock) <= 10 && (
                  <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[9px] font-black uppercase px-2.5 py-1 tracking-wider">
                    ⚠️ Low Stock
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <p className="font-black text-sm text-[color:var(--text-main)] line-clamp-1">{p.name}</p>
                <p className="text-[11px] text-[color:var(--text-muted)] line-clamp-2 min-h-[28px]">{p.description || "No description provided."}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[color:var(--primary)] font-black text-base">
                    ${p.price}
                    <span className="text-[10px] text-[color:var(--text-muted)] font-medium">/{p.unit}</span>
                  </span>
                  <span className="text-[10px] font-black px-2 py-1 bg-[color:var(--surface-soft)] text-[color:var(--text-main)]">
                    {p.stock} {p.unit}s
                  </span>
                </div>

                <p className="text-[10px] text-[color:var(--text-muted)] pt-1 truncate">
                  🚚 {p.supplier?.supplierBusinessName || p.supplier?.name || "Market Supplier"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[color:var(--bg-card-solid)] p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-lg font-black font-heading text-[color:var(--text-main)]">
                {editingProduct ? "✏️ Edit Farm Input" : "➕ Add New Agricultural Input"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2.5 text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-main)] transition-all"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Input Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Certified Hybrid Maize Seeds"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="flex-1 bg-[color:var(--surface-soft)] px-4 py-3 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex-1 bg-[color:var(--surface-soft)] px-4 py-3 text-xs font-bold text-[color:var(--text-main)] focus:outline-none"
                >
                  {AGRICULTURAL_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Unit of Measure
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="flex-1 bg-[color:var(--surface-soft)] px-4 py-3 text-xs font-bold text-[color:var(--text-main)] focus:outline-none"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u} className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="flex-1 bg-[color:var(--surface-soft)] px-4 py-3 text-xs font-bold text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Stock Units
                </label>
                <input
                  type="number"
                  placeholder="100"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  className="flex-1 bg-[color:var(--surface-soft)] px-4 py-3 text-xs font-bold text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Agrovet Supplier
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="flex-1 bg-[color:var(--surface-soft)] px-4 py-3 text-xs font-bold text-[color:var(--text-main)] focus:outline-none"
                >
                  <option value="" className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
                    -- Platform Default Supplier --
                  </option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[color:var(--bg-card-solid)] text-[color:var(--text-main)]">
                      {s.supplierBusinessName || s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)] pt-3">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Germination rate, NPK ratio, dosage recommendations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex-1 bg-[color:var(--surface-soft)] p-4 text-xs text-[color:var(--text-main)] placeholder:text-[color:var(--text-muted)] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-36 shrink-0 text-xs font-bold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, images: e.target.files })}
                  required={!editingProduct}
                  className="flex-1 bg-[color:var(--surface-soft)] p-2.5 text-xs text-[color:var(--text-main)] file:mr-4 file:border-0 file:bg-[color:var(--primary)] file:px-4 file:py-2 file:text-[10px] file:font-black file:uppercase file:tracking-[0.16em] file:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3.5 bg-[color:var(--primary)] hover:bg-[color:var(--primary-hover)] text-white font-black text-xs uppercase tracking-widest shadow-md transition-all"
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