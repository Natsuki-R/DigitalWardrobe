"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchAll } from "@/lib/fetch-all";
import type { ClothingItem, Outfit, OutfitWithItems } from "@/lib/types";

type OutfitRow = Outfit & { outfit_items: { clothes_id: string }[] | null };

export function useOutfits() {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutfits = useCallback(async () => {
    setLoading(true);

    // Each outfit embeds its own item links, so the 1,000-row page limit
    // counts outfits (days) rather than outfit_items rows. `date` is unique,
    // which keeps paging stable.
    const [{ data: outfitData }, { data: allClothes }] = await Promise.all([
      fetchAll<OutfitRow>((from, to) =>
        supabase
          .from("outfits")
          .select("*, outfit_items(clothes_id)")
          .order("date", { ascending: false })
          .range(from, to)
      ),
      fetchAll<ClothingItem>((from, to) =>
        supabase.from("clothes").select("*").order("id").range(from, to)
      ),
    ]);

    if (!outfitData) {
      setLoading(false);
      return;
    }

    const clothesMap = new Map<string, ClothingItem>();
    allClothes?.forEach((c) => clothesMap.set(c.id, c));

    const outfitsWithItems: OutfitWithItems[] = outfitData.map(
      ({ outfit_items, ...outfit }) => {
        const items = (outfit_items ?? [])
          .map((oi) => clothesMap.get(oi.clothes_id))
          .filter(Boolean) as ClothingItem[];
        return { ...outfit, items };
      }
    );

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

    // Save involves multiple tables — full refetch is safest here
    await fetchOutfits();
  };

  const toggleStar = async (outfitId: string) => {
    const outfit = outfits.find((o) => o.id === outfitId);
    if (!outfit) return;

    const newStarred = !outfit.starred;

    // Optimistic update
    setOutfits((prev) =>
      prev.map((o) =>
        o.id === outfitId ? { ...o, starred: newStarred } : o
      )
    );

    const { error } = await supabase
      .from("outfits")
      .update({ starred: newStarred })
      .eq("id", outfitId);

    if (error) {
      // Rollback
      setOutfits((prev) =>
        prev.map((o) =>
          o.id === outfitId ? { ...o, starred: !newStarred } : o
        )
      );
      throw error;
    }
  };

  const deleteOutfit = async (outfitId: string) => {
    // Optimistic: remove from local state
    const prev = outfits;
    setOutfits((current) => current.filter((o) => o.id !== outfitId));

    const { error } = await supabase.from("outfits").delete().eq("id", outfitId);

    if (error) {
      setOutfits(prev);
      throw error;
    }
  };

  const getOutfitByDate = (date: string) => {
    return outfits.find((o) => o.date === date);
  };

  return { outfits, loading, saveOutfit, deleteOutfit, toggleStar, getOutfitByDate, refetch: fetchOutfits };
}
