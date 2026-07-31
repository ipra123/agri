import express from "express";
import { protect, supplierOnly } from "../middleware/auth.middleware.js";
import { getSupplierDashboard, getSupplierOrders, getSupplierProducts, updateOrderStatus, cancelOrderWithRefund, resolveComplaint, deleteOrder } from "../controllers/supplier.controller.js";

const router = express.Router();

router.get("/dashboard", protect, supplierOnly, getSupplierDashboard);
router.get("/orders", protect, supplierOnly, getSupplierOrders);
router.get("/products", protect, supplierOnly, getSupplierProducts);

router.put(
    "/orders/:id/status",
    protect,
    supplierOnly,
    updateOrderStatus
);
router.post("/orders/:id/cancel", protect, supplierOnly, cancelOrderWithRefund);

router.put("/orders/:id/resolve", protect, supplierOnly, resolveComplaint);
router.delete("/orders/:id", protect, supplierOnly, deleteOrder);
export default router;
