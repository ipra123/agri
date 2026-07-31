import express from "express";
import { getFinanceSummary } from "../controllers/refund.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/summary", protect, adminOnly, getFinanceSummary);

export default router;
