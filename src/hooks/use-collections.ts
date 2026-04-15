"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadCollectionImage, deleteCollectionImage } from "@/lib/storage";
import type { CollectionItem, CollectionCategory } from "@/lib/types";

export function useCollections() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);

    const { data } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    setItems(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (
    data: {
      name: string;
      category: CollectionCategory;
      brand?: string;
      notes?: string;
    },
    imageFile?: File
  ) => {
    let image_url: string | null = null;
    if (imageFile) {
      image_url = await uploadCollectionImage(imageFile);
    }

    const { data: inserted, error } = await supabase
      .from("collections")
      .insert({ ...data, image_url })
      .select()
      .single();

    if (error) throw error;

    setItems((prev) => [inserted, ...prev]);
  };

  const updateItem = async (
    id: string,
    data: {
      name: string;
      category: CollectionCategory;
      brand?: string;
      notes?: string;
    },
    imageFile?: File,
    existingImageUrl?: string | null
  ) => {
    let image_url = existingImageUrl ?? null;

    if (imageFile) {
      if (existingImageUrl) {
        await deleteCollectionImage(existingImageUrl);
      }
      image_url = await uploadCollectionImage(imageFile);
    }

    const { data: updated, error } = await supabase
      .from("collections")
      .update({ ...data, image_url })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
  };

  const archiveItem = async (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, archived: true } : item
      )
    );

    const { error } = await supabase
      .from("collections")
      .update({ archived: true })
      .eq("id", id);

    if (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, archived: false } : item
        )
      );
      throw error;
    }
  };

  const unarchiveItem = async (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, archived: false } : item
      )
    );

    const { error } = await supabase
      .from("collections")
      .update({ archived: false })
      .eq("id", id);

    if (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, archived: true } : item
        )
      );
      throw error;
    }
  };

  const deleteItem = async (item: CollectionItem) => {
    setItems((prev) => prev.filter((c) => c.id !== item.id));

    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", item.id);

    if (error) {
      await fetchItems();
      throw error;
    }

    if (item.image_url) {
      await deleteCollectionImage(item.image_url);
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItem,
    archiveItem,
    unarchiveItem,
    deleteItem,
    refetch: fetchItems,
  };
}
