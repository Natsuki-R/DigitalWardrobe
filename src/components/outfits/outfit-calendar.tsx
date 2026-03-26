"use client";

import { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shirt } from "lucide-react";
import { OutfitEditor } from "./outfit-editor";
import { ClothesDetail } from "@/components/clothes/clothes-detail";
import { useOutfits } from "@/hooks/use-outfits";
import { useClothes } from "@/hooks/use-clothes";
import { useAuthContext } from "@/lib/auth-context";
import { toast } from "sonner";
import type { ClothingItem, OutfitWithItems } from "@/lib/types";

export function OutfitCalendar() {
  const { outfits, loading: outfitsLoading, saveOutfit, deleteOutfit } = useOutfits();
  const { clothes, loading: clothesLoading, refetch: refetchClothes } = useClothes();
  const { isOwner } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ClothingItem | null>(null);

  const loading = outfitsLoading || clothesLoading;

  // Find outfit for selected date
  const selectedOutfit: OutfitWithItems | undefined = selectedDate
    ? outfits.find(
        (o) => o.date === format(selectedDate, "yyyy-MM-dd")
      )
    : undefined;

  // Dates that have outfits logged
  const outfitDates = outfits.map((o) => new Date(o.date + "T00:00:00"));

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
    <div className="flex gap-6 flex-col lg:flex-row">
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
                            unoptimized
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
