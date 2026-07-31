import { supabase } from "./supabase.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localUploadDir = path.join(__dirname, "../../uploads");

const ensureLocalUploadDir = async () => {
  await fs.mkdir(localUploadDir, { recursive: true });
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
  if (!supabase) {
    const fileName = url.split("/").pop();
    if (!fileName) return;
    try {
      await fs.unlink(path.join(localUploadDir, fileName));
    } catch (error) {
      console.error("Error deleting local upload:", error.message);
    }
    return;
  }

  const path = url.split("/").slice(-2).join("/"); // folder/filename
  const { error } = await supabase.storage.from("decorations").remove([path]);
  if (error) {
    console.error("Error deleting from Supabase:", error);
  }
};
