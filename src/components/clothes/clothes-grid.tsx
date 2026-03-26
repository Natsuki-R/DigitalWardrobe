"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClothesCard } from "./clothes-card";
import { ClothesForm } from "./clothes-form";
import { ClothesDetail } from "./clothes-detail";
import { useClothes } from "@/hooks/use-clothes";
import { useAuthContext } from "@/lib/auth-context";
import { CATEGORIES, type ClothingCategory, type ClothingItemWithCount } from "@/lib/types";
import { toast } from "sonner";

export function ClothesGrid() {
  const { clothes, loading, addClothing, updateClothing, deleteClothing } =
    useClothes();
  const { isOwner } = useAuthContext();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItemWithCount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ClothingItemWithCount | null>(null);
  const [previewItem, setPreviewItem] = useState<ClothingItemWithCount | null>(null);

  const filtered = clothes
    .filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.color?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "most-worn":
          return b.wear_count - a.wear_count;
        case "least-worn":
          return a.wear_count - b.wear_count;
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleAdd = async (
    data: { name: string; category: ClothingCategory; brand?: string; color?: string; notes?: string },
    imageFile?: File
  ) => {
    await addClothing(data, imageFile);
    setDialogOpen(false);
    toast.success("Item added to your closet");
  };

  const handleEdit = async (
    data: { name: string; category: ClothingCategory; brand?: string; color?: string; notes?: string },
    imageFile?: File
  ) => {
    if (!editingItem) return;
    await updateClothing(editingItem.id, data, imageFile, editingItem.image_url);
    setEditingItem(null);
    toast.success("Item updated");
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteClothing(deleteConfirm);
    setDeleteConfirm(null);
    toast.success("Item removed from your closet");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-6 pb-4 max-w-7xl mx-auto space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">My Closet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              All your clothing items in one place
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clothes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most-worn">Most worn</SelectItem>
                <SelectItem value="least-worn">Least worn</SelectItem>
              </SelectContent>
            </Select>
            {isOwner && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>

          {/* Category Tabs */}
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className="flex-wrap h-auto w-full gap-1">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 p-6 pt-4 max-w-7xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {clothes.length === 0
                ? "Your closet is empty. Add your first item!"
                : "No items match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <ClothesCard
                key={item.id}
                item={item}
                onClick={setPreviewItem}
                onEdit={isOwner ? setEditingItem : undefined}
                onDelete={isOwner ? setDeleteConfirm : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {previewItem && (
        <ClothesDetail
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={
            isOwner
              ? () => {
                  setPreviewItem(null);
                  setEditingItem(previewItem);
                }
              : undefined
          }
          onDelete={
            isOwner
              ? () => {
                  setPreviewItem(null);
                  setDeleteConfirm(previewItem);
                }
              : undefined
          }
        />
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Clothing Item</DialogTitle>
          </DialogHeader>
          <ClothesForm onSubmit={handleAdd} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <ClothesForm
              item={editingItem}
              onSubmit={handleEdit}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &quot;{deleteConfirm?.name}&quot;?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove this item and its photo. This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
