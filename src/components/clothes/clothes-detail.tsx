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
import { Shirt, Pencil, Trash2, Archive, ArchiveRestore, Star } from "lucide-react";
import type { ClothingItemWithCount } from "@/lib/types";
import { useOutfitsForClothing } from "@/hooks/use-outfits-for-clothing";

interface ClothesDetailProps {
  item: ClothingItemWithCount;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

export function ClothesDetail({ item, onClose, onEdit, onDelete, onArchive, onUnarchive }: ClothesDetailProps) {
  const { outfits: wornIn, loading: wornInLoading } = useOutfitsForClothing(item.id);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>


        {/* Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">{item.category}</Badge>
            {item.archived && <Badge variant="outline">Archived</Badge>}
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

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {wornInLoading
                ? "Worn in…"
                : wornIn.length === 0
                ? "Not worn in any logged outfit yet"
                : `Worn in ${wornIn.length} outfit${wornIn.length === 1 ? "" : "s"}`}
            </h3>

            {wornInLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : wornIn.length > 0 ? (
              <ul className="space-y-2">
                {wornIn.map((outfit) => (
                  <li
                    key={outfit.id}
                    className="flex gap-3 rounded-md border p-2"
                  >
                    <div className="flex flex-col w-16 shrink-0 pt-0.5">
                      <span className="text-xs font-medium">
                        {format(new Date(outfit.date + "T00:00:00"), "MMM d")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(outfit.date + "T00:00:00"), "yyyy")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                      {outfit.items.map((it) => (
                        <div
                          key={it.id}
                          className={`relative h-10 w-10 shrink-0 rounded bg-muted overflow-hidden ${
                            it.id === item.id ? "ring-2 ring-primary" : ""
                          }`}
                          title={it.name}
                        >
                          {it.image_url ? (
                            <Image
                              src={it.image_url}
                              alt={it.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Shirt className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {outfit.starred && (
                      <Star className="h-3.5 w-3.5 shrink-0 mt-1 fill-yellow-400 text-yellow-400" />
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* Actions */}
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
