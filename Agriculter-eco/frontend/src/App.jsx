import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

import useAuthStore from "./store/useAuthStore";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminRefunds from "./pages/admin/AdminRefunds";
import AdminReviews from "./pages/admin/AdminReviews";

// Supplier Pages
import SupplierLayout from "./components/supplier/SupplierLayout";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierProducts from "./pages/supplier/SupplierProducts";
import SupplierOrders from "./pages/supplier/SupplierOrders";
import SupplierProfile from "./pages/supplier/SupplierProfile";

import AdminLayout from "./components/admin/AdminLayout";

const ProtectedRoute = ({ children, adminOnly = false, supplierOnly = false }) => {
  const { user, loading } = useAuthStore();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/" />;
  if (supplierOnly && user.role !== "SUPPLIER") return <Navigate to="/" />;

  return children;
};

function App() {
  const { checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p className="text-xs uppercase tracking-[4px]">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Routes>
        {/* Public & User Routes with Navbar/Footer */}
        <Route element={<><Navbar /><main className="content"><Outlet /></main><Footer /></>}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        </Route>

        {/* Operations Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute adminOnly><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/refunds" element={<ProtectedRoute adminOnly><AdminRefunds /></ProtectedRoute>} />
          <Route path="/dashboard/refunds" element={<ProtectedRoute adminOnly><AdminRefunds /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute adminOnly><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/finance" element={<ProtectedRoute adminOnly><AdminFinance /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute adminOnly><AdminInventory /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
        </Route>

        <Route element={<SupplierLayout />}>
          <Route path="/supplier" element={<ProtectedRoute supplierOnly><SupplierDashboard /></ProtectedRoute>} />
          <Route path="/supplier/products" element={<ProtectedRoute supplierOnly><SupplierProducts /></ProtectedRoute>} />
          <Route path="/supplier/orders" element={<ProtectedRoute supplierOnly><SupplierOrders /></ProtectedRoute>} />
          <Route path="/supplier/profile" element={<ProtectedRoute supplierOnly><SupplierProfile /></ProtectedRoute>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
