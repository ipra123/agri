import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import refundRoutes from "./routes/refund.routes.js";
import financeRoutes from "./routes/finance.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import disputeRoutes from "./routes/dispute.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import prisma from "./lib/prisma.js";

dotenv.config();


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/userchatingfiles", express.static(path.join(__dirname, "../userchatingfiles")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Socket.io for order updates
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-order", (orderId) => {
    socket.join(orderId);
    console.log(`User joined order: ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible to routers
app.set("io", io);

// Basic health check
app.get("/", (req, res) => {
  res.send("AgriConnect Market API is running");
});

app.get("/api/settings", async (req, res) => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/supplier", supplierRoutes);





const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
