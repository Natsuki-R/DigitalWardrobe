"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ClothingItemWithCount } from "@/lib/types";

interface Stats {
  totalItems: number;
  totalOutfits: number;
  topWorn: ClothingItemWithCount[];
  neverWorn: ClothingItemWithCount[];
  categoryBreakdown: { category: string; count: number }[];
  avgItemsPerOutfit: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      const [{ data: clothes }, { data: outfits }, { data: outfitItems }] =
        await Promise.all([
          supabase.from("clothes").select("*"),
          supabase.from("outfits").select("*"),
          supabase.from("outfit_items").select("clothes_id"),
        ]);

      if (!clothes) {
        setLoading(false);
        return;
      }

      // Wear counts
      const countMap: Record<string, number> = {};
      outfitItems?.forEach((item) => {
        countMap[item.clothes_id] = (countMap[item.clothes_id] || 0) + 1;
      });

      const withCounts: ClothingItemWithCount[] = clothes.map((c) => ({
        ...c,
        wear_count: countMap[c.id] || 0,
      }));

      const sorted = [...withCounts].sort(
        (a, b) => b.wear_count - a.wear_count
      );

      // Category breakdown
      const catMap: Record<string, number> = {};
      clothes.forEach((c) => {
        catMap[c.category] = (catMap[c.category] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      const totalOutfits = outfits?.length ?? 0;
      const totalOutfitItems = outfitItems?.length ?? 0;

      setStats({
        totalItems: clothes.length,
        totalOutfits,
        topWorn: sorted.filter((c) => c.wear_count > 0).slice(0, 10),
        neverWorn: sorted.filter((c) => c.wear_count === 0),
        categoryBreakdown,
        avgItemsPerOutfit:
          totalOutfits > 0 ? Math.round((totalOutfitItems / totalOutfits) * 10) / 10 : 0,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
