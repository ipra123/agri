import express from "express";
import multer from "multer";
import { register, login, logout, getProfile, updateProfile, getProfilePhoto, sendOtp, verifyOtp, forgotPassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
