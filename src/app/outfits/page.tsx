import { OutfitCalendar } from "@/components/outfits/outfit-calendar";

export default function OutfitsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Daily Outfits</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Log what you wear each day
        </p>
      </div>
      <OutfitCalendar />
    </div>
  );
}
