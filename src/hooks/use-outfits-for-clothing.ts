"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ClothingCategory } from "@/lib/types";

export interface WornInOutfit {
  id: string;
  date: string;
  starred: boolean;
  notes: string | null;
  items: {
    id: string;
    name: string;
    category: ClothingCategory;
    image_url: string | null;
  }[];
}

export function useOutfitsForClothing(clothesId: string) {
  const [outfits, setOutfits] = useState<WornInOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Find which outfits include this item (uses idx_outfit_items_clothes_id)
      const { data: links, error: linksErr } = await supabase
        .from("outfit_items")
        .select("outfit_id")
        .eq("clothes_id", clothesId);

      if (linksErr) {
        if (!cancelled) {
          setOutfits([]);
          setLoading(false);
        }
        return;
      }

      const outfitIds = links?.map((l) => l.outfit_id) ?? [];
      if (outfitIds.length === 0) {
        if (!cancelled) {
          setOutfits([]);
          setLoading(false);
        }
        return;
      }

      // 2. Fetch those outfits with all their items joined (for sibling thumbnails)
      const { data, error } = await supabase
        .from("outfits")
        .select(
          `
          id,
          date,
          starred,
          notes,
          outfit_items (
            clothes:clothes ( id, name, category, image_url )
          )
        `
        )
        .in("id", outfitIds)
        .order("date", { ascending: false });

      if (cancelled) return;

      if (error || !data) {
        setOutfits([]);
        setLoading(false);
        return;
      }

      type RawRow = {
        id: string;
        date: string;
        starred: boolean;
        notes: string | null;
        outfit_items:
          | { clothes: WornInOutfit["items"][number] | WornInOutfit["items"][number][] | null }[]
          | null;
      };

      const result: WornInOutfit[] = (data as unknown as RawRow[]).map((o) => ({
        id: o.id,
        date: o.date,
        starred: o.starred,
        notes: o.notes ?? null,
        items: (o.outfit_items ?? [])
          .flatMap((oi) =>
            Array.isArray(oi.clothes) ? oi.clothes : oi.clothes ? [oi.clothes] : []
          ),
      }));

      setOutfits(result);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [clothesId]);

  return { outfits, loading };
}
