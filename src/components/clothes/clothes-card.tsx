"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Shirt } from "lucide-react";
import type { ClothingItemWithCount } from "@/lib/types";

interface ClothesCardProps {
  item: ClothingItemWithCount;
  onEdit?: (item: ClothingItemWithCount) => void;
  onDelete?: (item: ClothingItemWithCount) => void;
}

export function ClothesCard({ item, onEdit, onDelete }: ClothesCardProps) {
  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-square bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Shirt className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors" />}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(item)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {item.wear_count > 0 && (
          <Badge className="absolute bottom-2 left-2 text-xs" variant="secondary">
            Worn {item.wear_count}x
          </Badge>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
          {item.category}
          {item.brand && ` · ${item.brand}`}
        </p>
      </div>
    </Card>
  );
}
