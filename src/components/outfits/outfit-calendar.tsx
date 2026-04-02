"use client";

import { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shirt, Star } from "lucide-react";
import { OutfitEditor } from "./outfit-editor";
import { ClothesDetail } from "@/components/clothes/clothes-detail";
import { useOutfits } from "@/hooks/use-outfits";
import { useClothes } from "@/hooks/use-clothes";
import { useAuthContext } from "@/lib/auth-context";
import { toast } from "sonner";
import type { ClothingItem, OutfitWithItems } from "@/lib/types";

export function OutfitCalendar() {
  const { outfits, loading: outfitsLoading, saveOutfit, deleteOutfit, toggleStar } = useOutfits();
  const { clothes, loading: clothesLoading, refetch: refetchClothes } = useClothes();
  const { isOwner } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ClothingItem | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const loading = outfitsLoading || clothesLoading;

  // Find outfit for selected date
  const selectedOutfit: OutfitWithItems | undefined = selectedDate
    ? outfits.find(
        (o) => o.date === format(selectedDate, "yyyy-MM-dd")
      )
    : undefined;

  // Dates that have outfits logged
  const outfitDates = outfits.map((o) => new Date(o.date + "T00:00:00"));

  // Starred outfits
  const starredOutfits = outfits.filter((o) => o.starred);

  const handleSave = async (
    date: string,
    clothesIds: string[],
    notes?: string
  ) => {
    await saveOutfit(date, clothesIds, notes);
    await refetchClothes();
    toast.success("Outfit saved");
  };

  const handleDelete = async (outfitId: string) => {
    await deleteOutfit(outfitId);
    await refetchClothes();
    toast.success("Outfit removed");
  };

  if (loading) {
    return (
      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="w-full max-w-[350px] h-[320px] bg-muted animate-pulse rounded-lg" />
        <div className="flex-1 h-[200px] bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 flex-col lg:flex-row lg:flex-wrap">
      {/* Calendar */}
      <div className="flex justify-center lg:justify-start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date(2030, 11)}
          modifiers={{ hasOutfit: outfitDates }}
          modifiersStyles={{
            hasOutfit: {
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: "var(--primary)",
              textUnderlineOffset: "4px",
            },
          }}
          className="rounded-lg border"
        />
      </div>

      {/* Selected date detail */}
      <Card className="flex-1 p-6">
        {selectedDate ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {format(selectedDate, "EEEE, MMM d")}
              </h3>
              <div className="flex gap-2">
                {isOwner && selectedOutfit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleStar(selectedOutfit.id)}
                    title={selectedOutfit.starred ? "Unstar outfit" : "Star outfit"}
                  >
                    <Star
                      className={`h-4 w-4 ${selectedOutfit.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  </Button>
                )}
                {isOwner && (
                  <Button
                    size="sm"
                    variant={selectedOutfit ? "outline" : "default"}
                    onClick={() => setEditorOpen(true)}
                  >
                    {selectedOutfit ? (
                      "Edit"
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" /> Log Outfit
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {selectedOutfit ? (
              <div className="space-y-3">
                <div className="flex gap-3 flex-wrap">
                  {selectedOutfit.items.map((item) => (
                    <button
                      key={item.id}
                      className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setPreviewItem(item)}
                    >
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-muted">
                            <Shirt className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs mt-1 truncate max-w-20">
                        {item.name}
                      </p>
                    </button>
                  ))}
                </div>
                {selectedOutfit.notes && (
                  <p className="text-sm text-muted-foreground">
                    {selectedOutfit.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No outfit logged for this day.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a date to view or log an outfit.
          </p>
        )}
      </Card>

      {/* Starred outfits */}
      {starredOutfits.length > 0 && (
        <Card className="w-full p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <h3 className="font-semibold">Starred Outfits ({starredOutfits.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredOutfits.map((outfit) => (
              <button
                key={outfit.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left cursor-pointer"
                onClick={() => {
                  setSelectedDate(new Date(outfit.date + "T00:00:00"));
                }}
              >
                <div className="flex -space-x-2">
                  {outfit.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-background"
                    >
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          <Shirt className="h-3 w-3 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  ))}
                  {outfit.items.length > 3 && (
                    <div className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{outfit.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {format(new Date(outfit.date + "T00:00:00"), "MMM d, yyyy")}
                  </p>
                  {outfit.notes && (
                    <p className="text-xs text-muted-foreground truncate">
                      {outfit.notes}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Item preview dialog */}
      {previewItem && (
        <ClothesDetail
          item={{
            ...previewItem,
            wear_count: clothes.find((c) => c.id === previewItem.id)?.wear_count ?? 0,
          }}
          onClose={() => setPreviewItem(null)}
        />
      )}

      {/* Editor dialog */}
      {editorOpen && selectedDate && (
        <OutfitEditor
          date={selectedDate}
          outfit={selectedOutfit}
          clothes={clothes}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
