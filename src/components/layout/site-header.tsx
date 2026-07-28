"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  CircleUserRound,
  LogOut,
  Menu,
  Package,
  ShoppingBasket,
  ShoppingCart,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CART_UPDATED_EVENT, getCartCount } from "@/lib/cart";
import {
  clearCustomerSession,
  CUSTOMER_SESSION_EVENT,
  getCustomerToken,
  getCustomerUser,
} from "@/lib/auth/storage";
import type { AuthUser } from "@/types";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/custom-shopping", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders", authOnly: true },
];

function NavLink({
  href,
  label,
  onClick,
  className,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors",
        active ? "text-primary" : "text-foreground/80 hover:text-primary",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader({ cartCount: cartCountProp }: { cartCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cartCount, setCartCount] = useState(cartCountProp ?? 0);

  useEffect(() => {
    const sync = () => {
      const token = getCustomerToken();
      setIsLoggedIn(Boolean(token));
      setUser(token ? getCustomerUser<AuthUser>() : null);
    };
    sync();
    window.addEventListener(CUSTOMER_SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function logout() {
    clearCustomerSession();
    router.push("/login");
  }

  const displayName =
    user?.firstName?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";

  useEffect(() => {
    if (typeof cartCountProp === "number") {
      setCartCount(cartCountProp);
      return;
    }
    const sync = () => setCartCount(getCartCount());
    sync();
    window.addEventListener(CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [cartCountProp]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = navLinks.filter((link) => !link.authOnly || isLoggedIn);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur">
      <Container className="relative z-20 flex h-16 items-center justify-between gap-4 bg-background/95">
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
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="max-w-44 gap-1.5">
                  <CircleUserRound className="size-4" />
                  <span className="truncate">{displayName}</span>
                  <ChevronDown className="size-3.5 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user?.email ? (
                  <>
                    <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => router.push("/account")}
                >
                  <CircleUserRound className="size-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => router.push("/account?tab=orders")}
                >
                  <Package className="size-4" />
                  My orders
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => router.push("/sourcing-requests")}
                >
                  <ShoppingBasket className="size-4" />
                  Shopping requests
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onSelect={logout}
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button variant="outline" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="size-4" />
              {cartCount > 0 ? (
                <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full px-1 text-[10px]">
                  {cartCount}
                </Badge>
              ) : null}
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </Container>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-x-0 top-16 bottom-0 z-10 bg-foreground/35 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="absolute inset-x-0 top-full z-20 border-b border-border bg-background shadow-[0_24px_48px_-28px_rgba(34,34,34,0.45)] md:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Container className="py-5">
                <nav className="flex flex-col gap-1">
                  {links.map((link) => {
                    const active =
                      pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-xl px-3 py-3 text-base font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                <Button asChild className="mt-4 w-full" size="lg">
                  <Link
                    href={isLoggedIn ? "/account" : "/login"}
                    onClick={() => setOpen(false)}
                  >
                    {isLoggedIn ? "Account" : "Login"}
                  </Link>
                </Button>
              </Container>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
