import { supabase } from "./supabase";

export async function uploadClothesImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("clothes-images")
    .upload(fileName, file);

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
