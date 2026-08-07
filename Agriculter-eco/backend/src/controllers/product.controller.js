import prisma from "../lib/prisma.js";
import { uploadToSupabase, deleteFromSupabase } from "../lib/upload.js";

const PRODUCT_CATEGORIES = new Set([
  "SEEDS",
  "FERTILIZERS",
  "PESTICIDES",
  "FARM_TOOLS",
  "IRRIGATION_EQUIPMENT",
  "ANIMAL_FEED",
  "OTHER",
]);

const parseNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseInteger = (value, fallback = 0) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeCategory = (value) => (PRODUCT_CATEGORIES.has(value) ? value : "OTHER");

const queueLowStockNotification = async (product) => {
  if (!product?.supplierId) return;
  if (product.stockQuantity > product.lowStockThreshold) return;

  await prisma.notification.create({
    data: {
      userId: product.supplierId,
      type: "LOW_STOCK",
      channel: "EMAIL",
      message: `${product.name} is running low. Only ${product.stockQuantity} ${product.unit} left.`,
      status: "PENDING",
    },
  });
};

export const getProducts = async (req, res) => {
  try {
    const { search = "", category, supplierId, lowStock } = req.query;
    const products = await prisma.product.findMany({
      where: {
        ...(category && category !== "All" ? { category: normalizeCategory(category) } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(lowStock === "true"
          ? { OR: [{ stockQuantity: { lte: 10 } }, { stock: { lte: 10 } }] }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            businessName: true,
            supplierBusinessName: true,
            verificationStatus: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = products.map(p => {
      const reviews = p.reviews || [];
      const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
      return { ...p, avgRating: parseFloat(avgRating), reviewCount: reviews.length };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            businessName: true,
            supplierBusinessName: true,
            verificationStatus: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true, profilePhotoUrl: true } } },
          orderBy: { createdAt: "desc" },
        }
      },
    });

    if (product) {
      const reviews = product.reviews || [];
      const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
      res.json({ ...product, avgRating: parseFloat(avgRating), reviewCount: reviews.length });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    stockQuantity,
    lowStockThreshold,
    unit,
    category,
    supplierId,
  } = req.body;
  const files = req.files || [];

  try {
    if (req.user?.role === "SUPPLIER" && req.user?.verificationStatus !== "APPROVED") {
      return res.status(403).json({ message: "Your supplier account is not approved yet. Please wait for admin approval." });
    }

    const imageUrls = files.length > 0
      ? await Promise.all(files.map((file) => uploadToSupabase(file)))
      : [];

    const effectiveStock = parseInteger(stockQuantity ?? stock, 0);
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseNumber(price),
        stock: effectiveStock,
        stockQuantity: effectiveStock,
        lowStockThreshold: parseInteger(lowStockThreshold, 10),
        unit: unit || "piece",
        category: normalizeCategory(category),
        supplierId: req.user?.role === "SUPPLIER" ? req.user.id : supplierId || null,
        images: imageUrls,
      },
    });

    await queueLowStockNotification(product);

    res.status(201).json(product);
  } catch (error) {
    console.error("Create Product Backend Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    stockQuantity,
    lowStockThreshold,
    unit,
    category,
    supplierId,
  } = req.body;
  const files = req.files || [];

  try {
    if (req.user?.role === "SUPPLIER" && req.user?.verificationStatus !== "APPROVED") {
      return res.status(403).json({ message: "Your supplier account is not approved yet. Please wait for admin approval." });
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let imageUrls = product.images;

    if (files.length > 0) {
      await Promise.all(product.images.map((url) => deleteFromSupabase(url)));
      imageUrls = await Promise.all(files.map((file) => uploadToSupabase(file)));
    }

    const effectiveStock = stockQuantity ?? stock;
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: name || product.name,
        description: description || product.description,
        price: price ? parseNumber(price, product.price) : product.price,
        stock: effectiveStock !== undefined ? parseInteger(effectiveStock, product.stock) : product.stock,
        stockQuantity: effectiveStock !== undefined ? parseInteger(effectiveStock, product.stockQuantity) : product.stockQuantity,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInteger(lowStockThreshold, product.lowStockThreshold) : product.lowStockThreshold,
        unit: unit || product.unit,
        category: category ? normalizeCategory(category) : product.category,
        supplierId: req.user?.role === "SUPPLIER" ? req.user.id : (supplierId !== undefined ? supplierId : product.supplierId),
        images: imageUrls,
      },
    });

    await queueLowStockNotification(updatedProduct);

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (req.user?.role === "SUPPLIER" && req.user?.verificationStatus !== "APPROVED") {
      return res.status(403).json({ message: "Your supplier account is not approved yet. Please wait for admin approval." });
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Promise.all(product.images.map((url) => deleteFromSupabase(url)));

    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
