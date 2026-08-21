import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count({ where: { role: "FARMER" } });
    const totalSuppliers = await prisma.user.count({ where: { role: "SUPPLIER" } });
    const verifiedSuppliers = await prisma.user.count({
      where: { role: "SUPPLIER", verificationStatus: "APPROVED" },
    });
    const totalProducts = await prisma.product.count();
    const pendingKyc = await prisma.user.count({
      where: { role: "SUPPLIER", verificationStatus: "PENDING" },
    });
    const openDisputes = await prisma.dispute.count({ where: { status: "OPEN" } }).catch(() => 0);
    
    const revenue = await prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "RETURNED"] } },
      _sum: { totalAmount: true },
    });

    let pendingComplaints = 0;
    try {
      pendingComplaints = await prisma.order.count({
        where: { complaintStatus: "PENDING" }
      });
    } catch (e) {
      console.log("ComplaintStatus field might be missing in DB, run prisma db push");
    }

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    const [paymentTotals, recentTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "PAYMENT", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const rawOrdersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const ordersByStatus = rawOrdersByStatus.map((group) => ({
      status: group.status,
      value: group._count.id,
    }));

    // Calculate revenue trend for the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPayments = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { notIn: ["CANCELLED", "RETURNED"] },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      trendMap[dateStr] = 0;
    }

    recentPayments.forEach((order) => {
      const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (trendMap[dateStr] !== undefined) {
        trendMap[dateStr] += order.totalAmount;
      }
    });

    const revenueTrend = Object.keys(trendMap).map((date) => ({
      date,
      revenue: trendMap[date],
    }));

    res.json({
      totalOrders,
      totalUsers,
      totalSuppliers,
      verifiedSuppliers,
      pendingKyc,
      openDisputes,
      totalProducts,
      totalRevenue: revenue._sum.totalAmount || 0,
      transactionRevenue: paymentTotals._sum.amount || 0,
      recentTransactions,
      pendingComplaints,
      recentOrders,
      ordersByStatus,
      revenueTrend,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessName: true,
        supplierBusinessName: true,
        licenseDocumentUrl: true,
        supplierLicenseNumber: true,
        verificationStatus: true,
        verificationNotes: true,
        approvedBy: true,
        approvedAt: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: ["FARMER", "SUPPLIER", "ADMIN"].includes(role) ? role : "FARMER" },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStoreSettings = async (req, res) => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStoreSettings = async (req, res) => {
  try {
    const settings = await prisma.storeSettings.findFirst();
    const updated = await prisma.storeSettings.update({
      where: { id: settings.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
    });

    const enrichedTransactions = await Promise.all(
      transactions.map(async (t) => {
        if (t.orderId) {
          const order = await prisma.order.findUnique({
            where: { id: t.orderId },
            include: {
              user: { select: { name: true, email: true } },
              payments: true,
              items: { include: { product: true } }
            }
          });
          return { ...t, order };
        }
        return { ...t, order: null };
      })
    );

    res.json(enrichedTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryLogs = async (req, res) => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addInventoryLog = async (req, res) => {
  const { productId, type, quantity, note } = req.body;
  try {
    const log = await prisma.inventoryLog.create({
      data: { productId, type, quantity: parseInt(quantity), note },
    });

    // Update product stock accordingly
    const adjustment = (type === "STOCK_IN" || type === "RETURNED") ? parseInt(quantity) : -parseInt(quantity);
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: adjustment } },
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { name, email, password, role, businessName, supplierBusinessName, licenseDocumentUrl, supplierLicenseNumber, verificationStatus, verificationNotes, approvedBy, approvedAt } = req.body;
  try {
    const data = { name, email, role };
    if (businessName !== undefined) data.businessName = businessName;
    if (supplierBusinessName !== undefined) data.supplierBusinessName = supplierBusinessName;
    if (licenseDocumentUrl !== undefined) data.licenseDocumentUrl = licenseDocumentUrl;
    if (supplierLicenseNumber !== undefined) data.supplierLicenseNumber = supplierLicenseNumber;
    if (verificationStatus !== undefined) data.verificationStatus = verificationStatus;
    if (verificationNotes !== undefined) data.verificationNotes = verificationNotes;
    if (approvedBy !== undefined) data.approvedBy = approvedBy;
    if (approvedAt !== undefined) data.approvedAt = approvedAt;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessName: true,
        supplierBusinessName: true,
        licenseDocumentUrl: true,
        supplierLicenseNumber: true,
        verificationStatus: true,
        verificationNotes: true,
        approvedBy: true,
        approvedAt: true,
        createdAt: true,
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
