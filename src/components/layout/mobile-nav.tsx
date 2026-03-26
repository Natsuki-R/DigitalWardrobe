"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shirt, CalendarDays, BarChart3, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/lib/auth-context";

const navItems = [
  { href: "/closet", label: "Closet", icon: Shirt },
  { href: "/outfits", label: "Outfits", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuthContext();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        {user ? (
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
              pathname === "/login" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <User className="h-5 w-5" />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
