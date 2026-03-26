"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Shirt, Pencil, Trash2 } from "lucide-react";
import type { ClothingItemWithCount } from "@/lib/types";

interface ClothesDetailProps {
  item: ClothingItemWithCount;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ClothesDetail({ item, onClose, onEdit, onDelete }: ClothesDetailProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
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
              <Shirt className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">{item.category}</Badge>
            {item.color && <Badge variant="outline">{item.color}</Badge>}
            <Badge variant={item.wear_count > 0 ? "default" : "outline"}>
              Worn {item.wear_count}x
            </Badge>
          </div>

          {item.brand && (
            <div className="text-sm">
              <span className="text-muted-foreground">Brand: </span>
              {item.brand}
            </div>
          )}

          {item.notes && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">{item.notes}</p>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Added {format(new Date(item.created_at), "MMM d, yyyy")}
          </p>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete} className="flex-1">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
