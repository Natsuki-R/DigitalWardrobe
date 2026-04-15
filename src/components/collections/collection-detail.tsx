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
import { Package, Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react";
import type { CollectionItem } from "@/lib/types";

interface CollectionDetailProps {
  item: CollectionItem;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

export function CollectionDetail({ item, onClose, onEdit, onDelete, onArchive, onUnarchive }: CollectionDetailProps) {
  const categoryLabel = item.category === "cds" ? "CD" : item.category.replace(/s$/, "");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 90vw, 400px"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">{categoryLabel}</Badge>
            {item.archived && <Badge variant="outline">Archived</Badge>}
          </div>

          {item.brand && (
            <div className="text-sm">
              <span className="text-muted-foreground">
                {item.category === "albums" || item.category === "cds"
                  ? "Artist: "
                  : item.category === "books"
                    ? "Author: "
                    : "Brand: "}
              </span>
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

        {(onEdit || onDelete || onArchive || onUnarchive) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Edit
              </Button>
            )}
            {onArchive && (
              <Button variant="outline" size="sm" onClick={onArchive} className="flex-1">
                <Archive className="h-3.5 w-3.5 mr-2" />
                Archive
              </Button>
            )}
            {onUnarchive && (
              <Button variant="outline" size="sm" onClick={onUnarchive} className="flex-1">
                <ArchiveRestore className="h-3.5 w-3.5 mr-2" />
                Unarchive
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete} className="flex-1">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete permanently
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
