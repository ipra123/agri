import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    supplierBusinessName,
    supplierLicenseNumber,
  } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const allowedRoles = new Set(["FARMER", "SUPPLIER"]);
    const requestedRole = allowedRoles.has(role) ? role : "FARMER";

    // Auto-make first user an ADMIN
    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 ? "ADMIN" : requestedRole;

    if (assignedRole === "SUPPLIER" && !supplierBusinessName) {
      return res.status(400).json({ message: "Supplier business name is required" });
    }
    let profilePhotoBlob = null;
    let profilePhotoMime = null;

    if (req.file) {
      profilePhotoBlob = req.file.buffer;
      profilePhotoMime = req.file.mimetype;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        businessName: assignedRole === "SUPPLIER" ? supplierBusinessName : null,
        supplierBusinessName: assignedRole === "SUPPLIER" ? supplierBusinessName : null,
        licenseDocumentUrl: assignedRole === "SUPPLIER" ? supplierLicenseNumber || null : null,
        supplierLicenseNumber: assignedRole === "SUPPLIER" ? supplierLicenseNumber || null : null,
        verificationStatus: assignedRole === "SUPPLIER" ? "PENDING" : "NOT_APPLICABLE",
        profilePhotoBlob,
        profilePhotoMime,
      },
    });

    if (profilePhotoBlob) {
      const updatedUrl = `/api/auth/profile-photo/${user.id}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { profilePhotoUrl: updatedUrl },
      });
      user.profilePhotoUrl = updatedUrl;
    }

    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      supplierBusinessName: user.supplierBusinessName,
      licenseDocumentUrl: user.licenseDocumentUrl,
      supplierLicenseNumber: user.supplierLicenseNumber,
      verificationStatus: user.verificationStatus,
      profilePhotoUrl: user.profilePhotoUrl,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        supplierBusinessName: user.supplierBusinessName,
        licenseDocumentUrl: user.licenseDocumentUrl,
        supplierLicenseNumber: user.supplierLicenseNumber,
        verificationStatus: user.verificationStatus,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  res.json(req.user);
};

export const updateProfile = async (req, res) => {
  const {
    name,
    phoneNumber,
    profilePhotoUrl,
    deliveryAddress,
    businessName,
    supplierBusinessName,
    licenseDocumentUrl,
    supplierLicenseNumber,
  } = req.body;

  try {
    const data = {};
    if (name !== undefined) data.name = name;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (deliveryAddress !== undefined) data.deliveryAddress = deliveryAddress;

    if (req.file) {
      data.profilePhotoBlob = req.file.buffer;
      data.profilePhotoMime = req.file.mimetype;
      data.profilePhotoUrl = `/api/auth/profile-photo/${req.user.id}`;
    } else if (profilePhotoUrl !== undefined) {
      data.profilePhotoUrl = profilePhotoUrl;
    }

    if (req.user.role === "SUPPLIER") {
      if (businessName !== undefined) data.businessName = businessName;
      if (supplierBusinessName !== undefined) data.supplierBusinessName = supplierBusinessName;
      if (licenseDocumentUrl !== undefined) data.licenseDocumentUrl = licenseDocumentUrl;
      if (supplierLicenseNumber !== undefined) data.supplierLicenseNumber = supplierLicenseNumber;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
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

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfilePhoto = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        profilePhotoBlob: true,
        profilePhotoMime: true,
      },
    });

    if (!user || !user.profilePhotoBlob) {
      return res.status(404).send("Not found");
    }

    res.setHeader("Content-Type", user.profilePhotoMime || "image/jpeg");
    res.send(user.profilePhotoBlob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






/**
 * Seed script: Creates a default ADMIN user if one doesn't already exist.
 *
 * Usage:
 *   node seedAdmin.js
 *
 * You can override defaults via environment variables:
 *   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 */

const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "me@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123";

const seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin already exists with email: ${ADMIN_EMAIL}`);

      // Optional: ensure role stays ADMIN even if it was changed
      if (existingAdmin.role !== "ADMIN") {
        await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { role: "ADMIN" },
        });
        console.log("✅ Existing user role updated to ADMIN.");
      }

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN",
        verificationStatus: "NOT_APPLICABLE",
      },
    });

    console.log("✅ Default admin created successfully:");
    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log("⚠️  Please change this password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

//seedAdmin();
