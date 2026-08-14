import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.cookies?.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        profilePhotoUrl: true,
        deliveryAddress: true,
        businessName: true,
        supplierBusinessName: true,
        licenseDocumentUrl: true,
        supplierLicenseNumber: true,
        verificationStatus: true,
        verificationNotes: true,
        approvedBy: true,
        approvedAt: true,
      },
    });

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user account not found" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

export const supplierOrAdmin = (req, res, next) => {
  if (req.user && ["ADMIN", "SUPPLIER"].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin or supplier" });
  }
};

export const supplierOnly = (req, res, next) => {
  if (req.user && req.user.role === "SUPPLIER") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a supplier" });
  }
};
