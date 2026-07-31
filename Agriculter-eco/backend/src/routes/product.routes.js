import express from "express";
import multer from "multer";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect, supplierOrAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", protect, supplierOrAdmin, upload.array("images", 10), createProduct);
router.put("/:id", protect, supplierOrAdmin, upload.array("images", 10), updateProduct);
router.delete("/:id", protect, supplierOrAdmin, deleteProduct);

export default router;
