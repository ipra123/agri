import { v4 as uuidv4 } from "uuid";
import path from "path";
import { supabase } from "./supabase.js";

const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "agr";

export const uploadToSupabase = async (file, folder = "products") => {
  const fileExtension = path.extname(file.originalname || "").replace(".", "") || "bin";
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `${folder}/${fileName}`;

  if (!supabase) {
    throw new Error("Supabase storage is not configured for file uploads");
  }

  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(supabaseBucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const deleteFromSupabase = async (url) => {
  if (!url) return;

  if (!supabase || !/^https?:\/\//i.test(url)) return;

  const marker = `/storage/v1/object/public/${supabaseBucket}/`;
  const remotePath = url.includes(marker) ? url.split(marker)[1] : null;
  if (remotePath) {
    const { error } = await supabase.storage.from(supabaseBucket).remove([remotePath]);
    if (error) throw error;
  }
};
