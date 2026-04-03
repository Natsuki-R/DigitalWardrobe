import { supabase } from "./supabase";

const MAX_SIZE_BYTES = 100 * 1024; // 100KB
const MAX_DIMENSION = 800; // Max width or height — preserves aspect ratio

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= MAX_SIZE_BYTES) return file;

  const img = await createImageBitmap(file);
  let { width, height } = img;

  // Scale down proportionally if either side exceeds max
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  // Decrease quality until under target size
  for (let quality = 0.8; quality >= 0.1; quality -= 0.1) {
    const blob = await canvas.convertToBlob({ type: "image/webp", quality });
    if (blob.size <= MAX_SIZE_BYTES) return blob;
  }

  return canvas.convertToBlob({ type: "image/webp", quality: 0.1 });
}

export async function uploadClothesImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const fileName = `${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("clothes-images")
    .upload(fileName, compressed, { contentType: "image/webp" });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("clothes-images").getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteClothesImage(url: string): Promise<void> {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  if (!fileName) return;

  await supabase.storage.from("clothes-images").remove([fileName]);
}
