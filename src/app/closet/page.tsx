import { ClothesGrid } from "@/components/clothes/clothes-grid";

export default function ClosetPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">My Closet</h2>
        <p className="text-sm text-muted-foreground mt-1">
          All your clothing items in one place
        </p>
      </div>
      <ClothesGrid />
    </div>
  );
}
