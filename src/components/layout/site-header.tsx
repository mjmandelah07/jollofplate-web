"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCustomerToken } from "@/lib/auth/storage";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders", authOnly: true },
];

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors",
        active
          ? "text-primary"
          : "text-foreground/80 hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getCustomerToken()));
  }, []);

  const links = navLinks.filter((link) => !link.authOnly || isLoggedIn);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cart" className="relative gap-2">
              <ShoppingCart className="size-4" />
              Cart
              {cartCount > 0 ? (
                <Badge className="ml-1 h-5 min-w-5 rounded-full px-1.5">
                  {cartCount}
                </Badge>
              ) : null}
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={isLoggedIn ? "/orders" : "/login"}>
              {isLoggedIn ? "Account" : "Login"}
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button variant="outline" size="icon" asChild>
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="size-4" />
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <SheetHeader>
                <SheetTitle className="font-heading text-primary">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-5 px-1">
                {links.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    onClick={() => setOpen(false)}
                  />
                ))}
                <Button asChild className="mt-2">
                  <Link
                    href={isLoggedIn ? "/orders" : "/login"}
                    onClick={() => setOpen(false)}
                  >
                    {isLoggedIn ? "Account" : "Login"}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
