import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { getUserChatHistory, getChatUsers, getAdminChatHistory, sendAdminEmail } from "../controllers/chat.controller.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend/userchatingfiles exists
const uploadDir = path.join(__dirname, "../../userchatingfiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

router.post("/upload", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  
  // Return the file path to be stored in the message history
  const fileUrl = `/userchatingfiles/${req.file.filename}`;
  res.json({
    fileUrl,
    fileName: req.file.originalname,
    fileType: req.file.mimetype
  });
});

router.get("/history", protect, getUserChatHistory);
router.get("/admin/users", protect, adminOnly, getChatUsers);
router.get("/admin/history/:userId", protect, adminOnly, getAdminChatHistory);
router.post("/admin/send-email", protect, adminOnly, sendAdminEmail);

export default router;
