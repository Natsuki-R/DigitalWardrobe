"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/clothes/image-upload";
import { COLLECTION_CATEGORIES, type CollectionCategory, type CollectionItem } from "@/lib/types";

interface CollectionFormProps {
  item?: CollectionItem;
  onSubmit: (
    data: {
      name: string;
      category: CollectionCategory;
      brand?: string;
      notes?: string;
    },
    imageFile?: File
  ) => Promise<void>;
  onCancel: () => void;
}

const BRAND_LABELS: Record<string, string> = {
  albums: "Artist",
  cds: "Artist",
  books: "Author",
  devices: "Brand",
  other: "Brand",
};

export function CollectionForm({ item, onSubmit, onCancel }: CollectionFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<CollectionCategory>(
    item?.category ?? "albums"
  );
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const brandLabel = BRAND_LABELS[category] ?? "Brand";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSubmit(
        {
          name: name.trim(),
          category,
          brand: brand.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        imageFile ?? undefined
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ImageUpload
        value={item?.image_url}
        onChange={(file) => setImageFile(file)}
      />

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Abbey Road"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as CollectionCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLLECTION_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand">{brandLabel}</Label>
        <Input
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder={
            category === "albums" || category === "cds"
              ? "e.g. The Beatles"
              : category === "books"
                ? "e.g. Haruki Murakami"
                : "e.g. Apple"
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving || !name.trim()} className="flex-1">
          {saving ? "Saving..." : item ? "Update" : "Add Item"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
