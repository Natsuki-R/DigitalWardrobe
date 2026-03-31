"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadClothesImage, deleteClothesImage } from "@/lib/storage";
import type {
  ClothingItem,
  ClothingItemWithCount,
  ClothingCategory,
} from "@/lib/types";

export function useClothes() {
  const [clothes, setClothes] = useState<ClothingItemWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClothes = useCallback(async () => {
    setLoading(true);

    // Fetch clothes with wear count
    const { data: clothesData } = await supabase
      .from("clothes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!clothesData) {
      setLoading(false);
      return;
    }

    // Get wear counts
    const { data: countData } = await supabase
      .from("outfit_items")
      .select("clothes_id");

    const countMap: Record<string, number> = {};
    countData?.forEach((item) => {
      countMap[item.clothes_id] = (countMap[item.clothes_id] || 0) + 1;
    });

    const withCounts: ClothingItemWithCount[] = clothesData.map((item) => ({
      ...item,
      wear_count: countMap[item.id] || 0,
    }));

    setClothes(withCounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClothes();
  }, [fetchClothes]);

  const addClothing = async (
    data: {
      name: string;
      category: ClothingCategory;
      brand?: string;
      color?: string;
      notes?: string;
    },
    imageFile?: File
  ) => {
    let image_url: string | null = null;
    if (imageFile) {
      image_url = await uploadClothesImage(imageFile);
    }

    const { error } = await supabase.from("clothes").insert({
      ...data,
      image_url,
    });

    if (error) throw error;
    await fetchClothes();
  };

  const updateClothing = async (
    id: string,
    data: {
      name: string;
      category: ClothingCategory;
      brand?: string;
      color?: string;
      notes?: string;
    },
    imageFile?: File,
    existingImageUrl?: string | null
  ) => {
    let image_url = existingImageUrl ?? null;

    if (imageFile) {
      if (existingImageUrl) {
        await deleteClothesImage(existingImageUrl);
      }
      image_url = await uploadClothesImage(imageFile);
    }

    const { error } = await supabase
      .from("clothes")
      .update({ ...data, image_url })
      .eq("id", id);

    if (error) throw error;
    await fetchClothes();
  };

  const archiveClothing = async (id: string) => {
    const { error } = await supabase
      .from("clothes")
      .update({ archived: true })
      .eq("id", id);
    if (error) throw error;
    await fetchClothes();
  };

  const unarchiveClothing = async (id: string) => {
    const { error } = await supabase
      .from("clothes")
      .update({ archived: false })
      .eq("id", id);
    if (error) throw error;
    await fetchClothes();
  };

  const deleteClothing = async (item: ClothingItem) => {
    if (item.image_url) {
      await deleteClothesImage(item.image_url);
    }

    const { error } = await supabase.from("clothes").delete().eq("id", item.id);
    if (error) throw error;
    await fetchClothes();
  };

  return { clothes, loading, addClothing, updateClothing, archiveClothing, unarchiveClothing, deleteClothing, refetch: fetchClothes };
}
