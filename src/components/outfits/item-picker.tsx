"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Shirt, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ClothingItem } from "@/lib/types";

interface ItemPickerProps {
  clothes: ClothingItem[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function ItemPicker({ clothes, selected, onToggle }: ItemPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = clothes.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filtered.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle(item.id)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/20"
                )}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Shirt className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <p className="text-[10px] text-white truncate font-medium">
                    {item.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground text-center">
        {selected.length} item{selected.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}
