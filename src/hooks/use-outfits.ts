"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ClothingItem, OutfitWithItems } from "@/lib/types";

export function useOutfits() {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = useCallback(async () => {
    setLoading(true);

    const { data: outfitData } = await supabase
      .from("outfits")
      .select("*")
      .order("date", { ascending: false });

    if (!outfitData) {
      setLoading(false);
      return;
    }

    // Fetch items for all outfits
    const { data: outfitItems } = await supabase
      .from("outfit_items")
      .select("outfit_id, clothes_id");

    const { data: allClothes } = await supabase.from("clothes").select("*");

    const clothesMap = new Map<string, ClothingItem>();
    allClothes?.forEach((c) => clothesMap.set(c.id, c));

    const outfitsWithItems: OutfitWithItems[] = outfitData.map((outfit) => {
      const itemIds =
        outfitItems
          ?.filter((oi) => oi.outfit_id === outfit.id)
          .map((oi) => oi.clothes_id) ?? [];
      const items = itemIds
        .map((id) => clothesMap.get(id))
        .filter(Boolean) as ClothingItem[];
      return { ...outfit, items };
    });

    setOutfits(outfitsWithItems);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  const saveOutfit = async (
    date: string,
    clothesIds: string[],
    notes?: string
  ) => {
    // Upsert outfit
    const { data: existing } = await supabase
      .from("outfits")
      .select("id")
      .eq("date", date)
      .maybeSingle();

    let outfitId: string;

    if (existing) {
      outfitId = existing.id;
      // Update notes
      await supabase.from("outfits").update({ notes }).eq("id", outfitId);
      // Clear old items
      await supabase
        .from("outfit_items")
        .delete()
        .eq("outfit_id", outfitId);
    } else {
      const { data } = await supabase
        .from("outfits")
        .insert({ date, notes })
        .select("id")
        .single();
      if (!data) throw new Error("Failed to create outfit");
      outfitId = data.id;
    }

    // Insert new items
    if (clothesIds.length > 0) {
      const { error } = await supabase.from("outfit_items").insert(
        clothesIds.map((clothes_id) => ({
          outfit_id: outfitId,
          clothes_id,
        }))
      );
      if (error) throw error;
    }

    await fetchOutfits();
  };

  const toggleStar = async (outfitId: string) => {
    const outfit = outfits.find((o) => o.id === outfitId);
    if (!outfit) return;
    await supabase
      .from("outfits")
      .update({ starred: !outfit.starred })
      .eq("id", outfitId);
    await fetchOutfits();
  };

  const deleteOutfit = async (outfitId: string) => {
    await supabase.from("outfits").delete().eq("id", outfitId);
    await fetchOutfits();
  };

  const getOutfitByDate = (date: string) => {
    return outfits.find((o) => o.date === date);
  };

  return { outfits, loading, saveOutfit, deleteOutfit, toggleStar, getOutfitByDate, refetch: fetchOutfits };
}
