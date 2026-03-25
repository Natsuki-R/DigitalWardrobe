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
import { ImageUpload } from "./image-upload";
import { CATEGORIES, type ClothingCategory, type ClothingItem } from "@/lib/types";

interface ClothesFormProps {
  item?: ClothingItem;
  onSubmit: (
    data: {
      name: string;
      category: ClothingCategory;
      brand?: string;
      color?: string;
      notes?: string;
    },
    imageFile?: File
  ) => Promise<void>;
  onCancel: () => void;
}

export function ClothesForm({ item, onSubmit, onCancel }: ClothesFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<ClothingCategory>(
    item?.category ?? "tops"
  );
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [color, setColor] = useState(item?.color ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

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
          color: color.trim() || undefined,
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
          placeholder="e.g. White Oxford Shirt"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as ClothingCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Uniqlo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. White"
          />
        </div>
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
