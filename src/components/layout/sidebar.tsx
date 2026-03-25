"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, CalendarDays, BarChart3, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/lib/auth-context";

const navItems = [
  { href: "/closet", label: "Closet", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthContext();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r bg-card">
      <div className="p-6">
        <h1 className="text-xl font-semibold tracking-tight">Wardrobe</h1>
        <p className="text-sm text-muted-foreground mt-1">Your digital closet</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3">
        {user ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        ) : (
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}
