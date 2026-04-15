"use client";

import { useMemo, useState } from "react";
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
import { CollectionCard } from "./collection-card";
import { CollectionForm } from "./collection-form";
import { CollectionDetail } from "./collection-detail";
import { useCollections } from "@/hooks/use-collections";
import { useAuthContext } from "@/lib/auth-context";
import { COLLECTION_CATEGORIES, type CollectionCategory, type CollectionItem } from "@/lib/types";
import { toast } from "sonner";

export function CollectionGrid() {
  const { items, loading, addItem, updateItem, archiveItem, unarchiveItem, deleteItem } =
    useCollections();
  const { isOwner } = useAuthContext();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CollectionItem | null>(null);
  const [previewItem, setPreviewItem] = useState<CollectionItem | null>(null);
  const [saving, setSaving] = useState(false);

  const viewingArchived = categoryFilter === "archived";

  const activeItems = useMemo(() => items.filter((item) => !item.archived), [items]);
  const archivedItems = useMemo(() => items.filter((item) => item.archived), [items]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activeItems.length, archived: archivedItems.length };
    for (const item of activeItems) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [activeItems, archivedItems]);

  const filtered = (viewingArchived ? archivedItems : activeItems)
    .filter((item) => {
      if (!viewingArchived && categoryFilter !== "all" && item.category !== categoryFilter)
        return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleAdd = async (
    data: { name: string; category: CollectionCategory; brand?: string; notes?: string },
    imageFile?: File
  ) => {
    await addItem(data, imageFile);
    setDialogOpen(false);
    toast.success("Item added to your collection");
  };

  const handleEdit = async (
    data: { name: string; category: CollectionCategory; brand?: string; notes?: string },
    imageFile?: File
  ) => {
    if (!editingItem) return;
    await updateItem(editingItem.id, data, imageFile, editingItem.image_url);
    setEditingItem(null);
    toast.success("Item updated");
  };

  const handleArchive = async (item: CollectionItem) => {
    setSaving(true);
    try {
      await archiveItem(item.id);
      toast.success("Item archived");
    } catch {
      toast.error("Failed to archive item");
    } finally {
      setSaving(false);
    }
  };

  const handleUnarchive = async (item: CollectionItem) => {
    setSaving(true);
    try {
      await unarchiveItem(item.id);
      toast.success("Item restored to your collection");
    } catch {
      toast.error("Failed to restore item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      await deleteItem(deleteConfirm);
      setDeleteConfirm(null);
      toast.success("Item permanently deleted");
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setSaving(false);
    }
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
            <h2 className="text-2xl font-semibold tracking-tight">My Collections</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Albums, books, devices, and more
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
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
              <TabsTrigger value="all" className="text-xs">All ({categoryCounts.all})</TabsTrigger>
              {COLLECTION_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                  {cat.label} ({categoryCounts[cat.value] || 0})
                </TabsTrigger>
              ))}
              {categoryCounts.archived > 0 && (
                <TabsTrigger value="archived" className="text-xs">
                  Archived ({categoryCounts.archived})
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 p-6 pt-4 max-w-7xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {items.length === 0
                ? "Your collection is empty. Add your first item!"
                : "No items match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <CollectionCard
                key={item.id}
                item={item}
                onClick={setPreviewItem}
                onEdit={isOwner && !item.archived ? setEditingItem : undefined}
                onArchive={isOwner && !item.archived ? handleArchive : undefined}
                onUnarchive={isOwner && item.archived ? handleUnarchive : undefined}
                onDelete={isOwner && item.archived ? setDeleteConfirm : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {previewItem && (
        <CollectionDetail
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onEdit={
            isOwner && !previewItem.archived
              ? () => {
                  setPreviewItem(null);
                  setEditingItem(previewItem);
                }
              : undefined
          }
          onArchive={
            isOwner && !previewItem.archived
              ? () => {
                  handleArchive(previewItem);
                  setPreviewItem(null);
                }
              : undefined
          }
          onUnarchive={
            isOwner && previewItem.archived
              ? () => {
                  handleUnarchive(previewItem);
                  setPreviewItem(null);
                }
              : undefined
          }
          onDelete={
            isOwner && previewItem.archived
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
            <DialogTitle>Add to Collection</DialogTitle>
          </DialogHeader>
          <CollectionForm onSubmit={handleAdd} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <CollectionForm
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
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
