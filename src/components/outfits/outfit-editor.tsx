"use client";

import { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ItemPicker } from "./item-picker";
import { Shirt, Trash2 } from "lucide-react";
import type { ClothingItem, OutfitWithItems } from "@/lib/types";

interface OutfitEditorProps {
  date: Date;
  outfit?: OutfitWithItems;
  clothes: ClothingItem[];
  onSave: (date: string, clothesIds: string[], notes?: string) => Promise<void>;
  onDelete?: (outfitId: string) => Promise<void>;
  onClose: () => void;
}

export function OutfitEditor({
  date,
  outfit,
  clothes,
  onSave,
  onDelete,
  onClose,
}: OutfitEditorProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const [selected, setSelected] = useState<string[]>(
    outfit?.items.map((i) => i.id) ?? []
  );
  const [notes, setNotes] = useState(outfit?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const toggleItem = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(dateStr, selected, notes.trim() || undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (outfit && onDelete) {
      await onDelete(outfit.id);
      onClose();
    }
  };

  const selectedItems = clothes.filter((c) => selected.includes(c.id));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{format(date, "EEEE, MMMM d, yyyy")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected items preview */}
          {selectedItems.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="relative h-16 w-16 rounded-md overflow-hidden border"
                >
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted">
                      <Shirt className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Item picker */}
          <ItemPicker
            clothes={clothes}
            selected={selected}
            onToggle={toggleItem}
          />

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="outfit-notes">Notes</Label>
            <Input
              id="outfit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Office meeting, casual day..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || selected.length === 0}
              className="flex-1"
            >
              {saving ? "Saving..." : outfit ? "Update Outfit" : "Log Outfit"}
            </Button>
            {outfit && onDelete && (
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
