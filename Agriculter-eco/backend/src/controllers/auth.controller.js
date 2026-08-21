import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../lib/prisma.js";
import { sendOtpEmail, sendForgotPasswordEmail } from "../lib/sendEmails.js";

// In-memory store for OTPs: { [email]: { otp, expires } }
const otpStore = new Map();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildLocalProfilePhotoUrl = (filename) => `/uploads/profile-photos/${filename}`;
const buildLocalVerificationDocumentUrl = (filename) => `/uploads/verification-documents/${filename}`;

const getUploadedFile = (files, fieldName) => {
  if (!files || !files[fieldName]) return null;
  return Array.isArray(files[fieldName]) ? files[fieldName][0] : files[fieldName];
};

const getProfilePhotoFilePath = (profilePhotoUrl) => {
  if (!profilePhotoUrl || !profilePhotoUrl.startsWith("/uploads/profile-photos/")) return null;
  return path.join(__dirname, "../../", profilePhotoUrl.replace(/^\//, ""));
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    // Generate 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, { otp, expires, verified: false });

    await sendOtpEmail(cleanEmail, otp);
    res.json({ message: "OTP code sent to email successfully", email: cleanEmail });
  } catch (error) {
    console.error("sendOtp error:", error);
    res.status(500).json({ message: "Failed to send OTP email: " + error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP code are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const stored = otpStore.get(cleanEmail);

  if (!stored) {
    return res.status(400).json({ message: "No OTP request found for this email. Please request a new code." });
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ message: "OTP code has expired. Please request a new code." });
  }

  if (stored.otp !== otp.toString().trim()) {
    return res.status(400).json({ message: "Invalid OTP code" });
  }

  stored.verified = true;
  res.json({ success: true, message: "OTP verified successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate 6-digit random password
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Directly update password in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Send email with new password
    await sendForgotPasswordEmail(cleanEmail, newPassword);

    res.json({
      message: "Password reset successful! A new 6-digit password has been sent to your email.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: error.message });
  }
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
    const profilePhotoFile = getUploadedFile(req.files, "profilePhoto");
    const verificationDocumentFile = getUploadedFile(req.files, "verificationDocument");

    const allowedRoles = new Set(["FARMER", "SUPPLIER"]);
    const requestedRole = allowedRoles.has(role) ? role : "FARMER";

    // Auto-make first user an ADMIN
    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 ? "ADMIN" : requestedRole;

    if (assignedRole === "SUPPLIER" && !supplierBusinessName) {
      return res.status(400).json({ message: "Supplier business name is required" });
    }
    if (assignedRole === "SUPPLIER" && !verificationDocumentFile) {
      return res.status(400).json({ message: "Supplier verification document is required" });
    }
    let profilePhotoMime = null;
    let profilePhotoUrl = null;
    let licenseDocumentUrl = null;

    if (profilePhotoFile) {
      profilePhotoMime = profilePhotoFile.mimetype;
      profilePhotoUrl = buildLocalProfilePhotoUrl(profilePhotoFile.filename);
    }

    if (verificationDocumentFile) {
      licenseDocumentUrl = buildLocalVerificationDocumentUrl(verificationDocumentFile.filename);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        businessName: assignedRole === "SUPPLIER" ? supplierBusinessName : null,
        supplierBusinessName: assignedRole === "SUPPLIER" ? supplierBusinessName : null,
        supplierLicenseNumber: assignedRole === "SUPPLIER" ? supplierLicenseNumber || null : null,
        licenseDocumentUrl: assignedRole === "SUPPLIER" ? licenseDocumentUrl : null,
        verificationStatus: assignedRole === "SUPPLIER" ? "PENDING" : "NOT_APPLICABLE",
        profilePhotoMime,
        profilePhotoUrl,
      },
    });

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
    const profilePhotoFile = getUploadedFile(req.files, "profilePhoto");
    const verificationDocumentFile = getUploadedFile(req.files, "verificationDocument");

    if (name !== undefined) data.name = name;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (deliveryAddress !== undefined) data.deliveryAddress = deliveryAddress;

    if (profilePhotoFile) {
      data.profilePhotoMime = profilePhotoFile.mimetype;
      data.profilePhotoUrl = buildLocalProfilePhotoUrl(profilePhotoFile.filename);
    } else if (profilePhotoUrl !== undefined) {
      data.profilePhotoUrl = profilePhotoUrl;
    }

    if (req.user.role === "SUPPLIER") {
      if (businessName !== undefined) data.businessName = businessName;
      if (supplierBusinessName !== undefined) data.supplierBusinessName = supplierBusinessName;
      if (supplierLicenseNumber !== undefined) data.supplierLicenseNumber = supplierLicenseNumber;

      if (verificationDocumentFile) {
        data.licenseDocumentUrl = buildLocalVerificationDocumentUrl(verificationDocumentFile.filename);
        data.verificationStatus = "PENDING";
        data.verificationNotes = null;
      } else if (licenseDocumentUrl !== undefined) {
        data.licenseDocumentUrl = licenseDocumentUrl;
      }
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
        profilePhotoUrl: true,
        profilePhotoBlob: true,
        profilePhotoMime: true,
      },
    });

    if (!user) {
      return res.status(404).send("Not found");
    }

    const localPath = getProfilePhotoFilePath(user.profilePhotoUrl);
    if (localPath) {
      try {
        const file = await fs.readFile(localPath);
        res.setHeader("Content-Type", user.profilePhotoMime || "image/jpeg");
        return res.send(file);
      } catch {
        // Fall through to the legacy blob path below.
      }
    }

    if (!user.profilePhotoBlob) {
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

