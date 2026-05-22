"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Camera, Menu, User, LogOut, LayoutDashboard } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/yearbook", label: "Yearbook Photos" },
  { href: "/portraits", label: "Graduation Portraits" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

interface NavbarProps {
  user?: {
    email: string;
    role: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Grad-Pictures.today</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/download">My Downloads</Link>
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/yearbook">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t">
              {user ? (
                <>
                  <Link href="/download" className="text-sm font-medium">
                    My Downloads
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="text-sm font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link href="/api/auth/logout" className="text-sm font-medium text-destructive">
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium">
                    Sign In
                  </Link>
                  <Link href="/yearbook" className="text-sm font-medium text-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}