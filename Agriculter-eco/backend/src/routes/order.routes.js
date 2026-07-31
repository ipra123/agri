import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  getAllOrders,
  updateOrderStatus,
  submitComplaint,
  resolveComplaint,
  deleteOrder,
  getPayments,
} from "../controllers/order.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../userchatingfiles");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "proof-" + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return", protect, requestReturn);
router.post("/:id/complaint", protect, submitComplaint);

router.get("/:id/payments", protect, getPayments);
router.post("/upload-proof", protect, upload.single("proof"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const fileUrl = `/userchatingfiles/${req.file.filename}`;
  res.json({ fileUrl });
});

import { cancelOrderWithRefund } from "../controllers/refund.controller.js";

// Admin Routes
router.get("/", protect, adminOnly, getAllOrders);
router.post("/:id/cancel", protect, adminOnly, cancelOrderWithRefund);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/resolve", protect, adminOnly, resolveComplaint);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;
