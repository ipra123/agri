import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadDir = path.join(__dirname, "../../uploads");
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

const getExtension = (file) => {
  const fromName = path.extname(file.originalname || "").replace(".", "").trim();
  if (fromName) return fromName;
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  return mimeMap[file.mimetype] || "bin";
};

const getLocalFilePath = (url) => {
  if (!url) return null;
  const normalized = url.startsWith("/") ? url.slice(1) : url;
  if (!normalized.startsWith("uploads/")) return null;
  return path.join(__dirname, "../../", normalized);
};

export const uploadToSupabase = async (file, folder = "products") => {
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${folder}/${fileName}`;

  if (!supabase) {
    await ensureLocalUploadDir();
    const localFilePath = path.join(localUploadDir, fileName);
    await fs.writeFile(localFilePath, file.buffer);
    return `/uploads/${fileName}`;
  }

  const { data, error } = await supabase.storage
    .from("agr") // Make sure this bucket exists in your Supabase project
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("agr")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const deleteFromSupabase = async (url) => {
  if (!url) return;

  if (supabase && /^https?:\/\//i.test(url) && url.includes(`/storage/v1/object/public/${supabaseBucket}/`)) {
    const remotePath = url.split(`/storage/v1/object/public/${supabaseBucket}/`)[1];
    if (remotePath) {
      await supabase.storage.from(supabaseBucket).remove([remotePath]);
    }
    return;
  }

  const localPath = getLocalFilePath(url);
  if (!localPath) {
    return;
  }

  try {
    if (fsSync.existsSync(localPath)) {
      await fs.unlink(localPath);
    }
  } catch (error) {
    console.error("Error deleting local upload:", error.message);
  }
};
