import express from "express";
import multer from "multer";
import { register, login, logout, getProfile, updateProfile, getProfilePhoto } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", upload.single("profilePhoto"), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePhoto"), updateProfile);
router.get("/profile-photo/:id", getProfilePhoto);

export default router;
