import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { register, login, logout, getProfile, updateProfile, getProfilePhoto, sendOtp, verifyOtp, forgotPassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profilePhotoDir = path.join(__dirname, "../../uploads/profile-photos");
const verificationDocumentDir = path.join(__dirname, "../../uploads/verification-documents");

fs.mkdirSync(profilePhotoDir, { recursive: true });
fs.mkdirSync(verificationDocumentDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "verificationDocument") {
      return cb(null, verificationDocumentDir);
    }
    return cb(null, profilePhotoDir);
  },
  filename: (_, file, cb) => {
    const safeExt = path.extname(file.originalname) || ".jpg";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post(
  "/register",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "verificationDocument", maxCount: 1 },
  ]),
  register
);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "verificationDocument", maxCount: 1 },
  ]),
  updateProfile
);
router.get("/profile-photo/:id", getProfilePhoto);


export default router;
