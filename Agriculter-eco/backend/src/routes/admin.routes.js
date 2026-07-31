import express from "express";
import { 
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getStoreSettings,
  updateStoreSettings,
  getTransactions,
  getInventoryLogs,
  addInventoryLog,
  deleteUser,
  updateUser
} from "../controllers/admin.controller.js";



import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id/role", protect, adminOnly, updateUserRole);
router.put("/users/:id", protect, adminOnly, updateUser);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.get("/settings", protect, adminOnly, getStoreSettings);

router.put("/settings", protect, adminOnly, updateStoreSettings);
router.get("/transactions", protect, adminOnly, getTransactions);
router.get("/inventory", protect, adminOnly, getInventoryLogs);
router.post("/inventory", protect, adminOnly, addInventoryLog);



export default router;
