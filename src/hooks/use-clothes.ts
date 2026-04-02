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

    const { data: inserted, error } = await supabase
      .from("clothes")
      .insert({ ...data, image_url })
      .select()
      .single();

    if (error) throw error;

    // Optimistic: append to local state
    setClothes((prev) => [{ ...inserted, wear_count: 0 }, ...prev]);
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

    const { data: updated, error } = await supabase
      .from("clothes")
      .update({ ...data, image_url })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Optimistic: update in local state
    setClothes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...updated, wear_count: item.wear_count } : item
      )
    );
  };

  const archiveClothing = async (id: string) => {
    // Optimistic: update locally first
    setClothes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, archived: true } : item
      )
    );

    const { error } = await supabase
      .from("clothes")
      .update({ archived: true })
      .eq("id", id);

    if (error) {
      // Rollback on failure
      setClothes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, archived: false } : item
        )
      );
      throw error;
    }
  };

  const unarchiveClothing = async (id: string) => {
    // Optimistic: update locally first
    setClothes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, archived: false } : item
      )
    );

    const { error } = await supabase
      .from("clothes")
      .update({ archived: false })
      .eq("id", id);

    if (error) {
      // Rollback on failure
      setClothes((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, archived: true } : item
        )
      );
      throw error;
    }
  };

  const deleteClothing = async (item: ClothingItem) => {
    // Optimistic: remove from local state
    setClothes((prev) => prev.filter((c) => c.id !== item.id));

    const { error } = await supabase.from("clothes").delete().eq("id", item.id);

    if (error) {
      // Rollback: re-fetch to restore correct state
      await fetchClothes();
      throw error;
    }

    // Delete image after DB success to avoid orphans
    if (item.image_url) {
      await deleteClothesImage(item.image_url);
    }
  };

  return { clothes, loading, addClothing, updateClothing, archiveClothing, unarchiveClothing, deleteClothing, refetch: fetchClothes };
}
