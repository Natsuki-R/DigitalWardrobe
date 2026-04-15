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
import { MoreHorizontal, Pencil, Trash2, Archive, ArchiveRestore, Package } from "lucide-react";
import type { CollectionItem } from "@/lib/types";

interface CollectionCardProps {
  item: CollectionItem;
  onClick?: (item: CollectionItem) => void;
  onEdit?: (item: CollectionItem) => void;
  onDelete?: (item: CollectionItem) => void;
  onArchive?: (item: CollectionItem) => void;
  onUnarchive?: (item: CollectionItem) => void;
}

export function CollectionCard({ item, onClick, onEdit, onDelete, onArchive, onUnarchive }: CollectionCardProps) {
  const hasMenu = onEdit || onDelete || onArchive || onUnarchive;
  return (
    <Card className={`group overflow-hidden cursor-pointer ${item.archived ? "opacity-60" : ""}`} onClick={() => onClick?.(item)}>
      <div className="relative aspect-square bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {hasMenu && (
          <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
                {onArchive && (
                  <DropdownMenuItem onClick={() => onArchive(item)}>
                    <Archive className="h-3.5 w-3.5 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                {onUnarchive && (
                  <DropdownMenuItem onClick={() => onUnarchive(item)}>
                    <ArchiveRestore className="h-3.5 w-3.5 mr-2" />
                    Unarchive
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(item)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete permanently
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {item.archived && (
          <Badge className="absolute top-2 left-2 text-xs" variant="secondary">
            Archived
          </Badge>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
          {item.category === "cds" ? "CD" : item.category.replace(/s$/, "")}
          {item.brand && ` · ${item.brand}`}
        </p>
      </div>
    </Card>
  );
}
