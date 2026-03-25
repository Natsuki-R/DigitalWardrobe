"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shirt, CalendarDays, TrendingUp, AlertCircle } from "lucide-react";
import { useStats } from "@/hooks/use-stats";
import { CATEGORIES } from "@/lib/types";

export function StatsDashboard() {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getCategoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shirt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalOutfits}</p>
                <p className="text-xs text-muted-foreground">Outfits Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgItemsPerOutfit}</p>
                <p className="text-xs text-muted-foreground">Avg Items/Outfit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.neverWorn.length}</p>
                <p className="text-xs text-muted-foreground">Never Worn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Worn */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Worn Items</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topWorn.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No wear data yet. Start logging outfits!
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topWorn.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-5">
                      {i + 1}
                    </span>
                    <div className="relative h-10 w-10 rounded-md overflow-hidden border shrink-0">
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
                          <Shirt className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.category}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.wear_count}x</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat) => {
                  const pct = Math.round(
                    (cat.count / stats.totalItems) * 100
                  );
                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">
                          {getCategoryLabel(cat.category)}
                        </span>
                        <span className="text-muted-foreground">
                          {cat.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Never Worn */}
      {stats.neverWorn.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Never Worn ({stats.neverWorn.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {stats.neverWorn.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
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
                        <Shirt className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] mt-1 truncate max-w-[64px]">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
