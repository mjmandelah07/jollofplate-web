"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Minus,
  PackagePlus,
  Plus,
  Search,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getSourcingItems } from "@/lib/api/sourcing";
import { ApiError } from "@/lib/api/client";
import {
  SOURCING_CART_UPDATED_EVENT,
  addCatalogItemToSourcingCart,
  addCustomItemToSourcingCart,
  getSourcingCart,
  getSourcingCartCount,
  removeSourcingCartLine,
  updateSourcingCartQuantity,
  type SourcingCartLine,
} from "@/lib/sourcing-cart";
import type { SourcingItem } from "@/types/sourcing";
import { cn } from "@/lib/utils";

function CartLines({
  cart,
  dense = false,
}: {
  cart: SourcingCartLine[];
  dense?: boolean;
}) {
  if (cart.length === 0) {
    return (
      <div className="rounded-xl bg-muted/40 px-3.5 py-4 text-sm text-muted-foreground">
        Add catalog or custom items. No prices here — we quote on WhatsApp.
      </div>
    );
  }

  return (
    <ul className={cn("space-y-2", dense && "max-h-[50vh] overflow-y-auto pr-0.5")}>
      {cart.map((line) => (
        <li
          key={line.key}
          className="rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{line.name}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                {line.isCustom ? <span>Custom</span> : null}
                {line.unitHint ? <span>{line.unitHint}</span> : null}
              </div>
              {line.notes ? (
                <p className="mt-1 text-xs text-muted-foreground">{line.notes}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label={`Remove ${line.name}`}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              onClick={() => removeSourcingCartLine(line.key)}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="rounded-lg"
              onClick={() =>
                updateSourcingCartQuantity(line.key, line.quantity - 1)
              }
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-7 text-center text-sm font-semibold tabular-nums">
              {line.quantity}
            </span>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              className="rounded-lg"
              onClick={() =>
                updateSourcingCartQuantity(line.key, line.quantity + 1)
              }
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReviewButton({
  cartCount,
  className,
}: {
  cartCount: number;
  className?: string;
}) {
  if (cartCount > 0) {
    return (
      <Button className={cn("rounded-sm px-5 py-4", className)} asChild>
        <Link href="/custom-shopping/checkout">Review list</Link>
      </Button>
    );
  }

  return (
    <Button className={cn("rounded-xl", className)} disabled>
      Review list
    </Button>
  );
}

export function CustomShoppingManager() {
  const [items, setItems] = useState<SourcingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [cart, setCart] = useState<SourcingCartLine[]>([]);
  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState("1");
  const [customNotes, setCustomNotes] = useState("");
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    const sync = () => setCart(getSourcingCart());
    sync();
    window.addEventListener(SOURCING_CART_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SOURCING_CART_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    void (async () => {
      try {
        const data = await getSourcingItems({
          search: debouncedSearch || undefined,
          page: 1,
          limit: 50,
          signal: controller.signal,
        });
        setItems(data.items.filter((item) => item.available !== false));
      } catch (error) {
        if (controller.signal.aborted) return;
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not load shopping items",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedSearch]);

  const qtyByItemId = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of cart) {
      if (line.sourcingItemId) {
        map.set(line.sourcingItemId, line.quantity);
      }
    }
    return map;
  }, [cart]);

  const cartCount = getSourcingCartCount();
  const isFiltered = debouncedSearch.trim().length > 0;

  function addCustom(event: FormEvent) {
    event.preventDefault();
    if (!customName.trim()) {
      toast.error("Enter an item name");
      return;
    }
    addCustomItemToSourcingCart({
      name: customName,
      quantity: Number(customQty) || 1,
      notes: customNotes,
    });
    setCustomName("");
    setCustomQty("1");
    setCustomNotes("");
    toast.success("Added to your list");
  }

  return (
    <>
      <div className="grid gap-5 pb-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6 lg:pb-0 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4 sm:space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              aria-label="Search sourcing items"
              className="h-11 rounded-2xl border-border/80 bg-card pl-10 shadow-sm sm:h-12"
            />
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl sm:h-36" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-border/80 bg-card/70 py-0 shadow-none">
              <CardContent className="flex flex-col items-center px-5 py-12 text-center sm:py-14">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShoppingBasket className="size-5" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">
                  {isFiltered ? "No matching items" : "Catalog is empty"}
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {isFiltered
                    ? "Try another search, or add a custom item below."
                    : "Add a free-text item below and we’ll quote on WhatsApp."}
                </p>
                {isFiltered ? (
                  <Button
                    variant="outline"
                    className="mt-4 rounded-xl"
                    onClick={() => setSearch("")}
                  >
                    Clear search
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => {
                const inListQty = qtyByItemId.get(item.id) || 0;

                return (
                  <Card
                    key={item.id}
                    className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm"
                  >
                    <CardContent className="flex gap-3 p-3 sm:p-3.5">
                      <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 sm:size-24">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 72px, 96px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <PackagePlus className="size-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="font-heading text-sm font-semibold leading-snug text-foreground sm:text-[0.95rem]">
                          {item.name}
                        </h3>
                        {item.unitHint ? (
                          <p className="mt-0.5 text-xs font-medium text-primary/80">
                            {item.unitHint}
                          </p>
                        ) : null}
                        {item.description ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                        <div className="mt-auto flex items-center gap-2 pt-2.5">
                          <Button
                            size="sm"
                            className="h-8 rounded-lg px-3"
                            onClick={() => {
                              addCatalogItemToSourcingCart(item);
                              toast.success(`Added ${item.name}`);
                            }}
                          >
                            {inListQty > 0 ? (
                              <>
                                <Check className="size-3.5" />
                                Add more
                              </>
                            ) : (
                              <>
                                <Plus className="size-3.5" />
                                Add
                              </>
                            )}
                          </Button>
                          {inListQty > 0 ? (
                            <span className="text-xs font-medium text-muted-foreground tabular-nums">
                              ×{inListQty} in list
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="font-heading text-base font-semibold sm:text-lg">
                  Can’t find it?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a free-text item — we’ll quote on WhatsApp.
                </p>
              </div>

              <form onSubmit={addCustom} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-name">Item name</Label>
                  <Input
                    id="custom-name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Golden Penny semolina 10kg"
                    className="h-11 rounded-xl"
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-qty">Qty</Label>
                    <Input
                      id="custom-qty"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={customQty}
                      onChange={(e) => setCustomQty(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-notes">Note (optional)</Label>
                    <Input
                      id="custom-notes"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      placeholder="Brand, size, or preference"
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl sm:w-auto"
                >
                  <Plus className="size-4" />
                  Add custom item
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
          <Card className="gap-0 rounded-2xl border-border/70 py-0 shadow-sm">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading text-base font-semibold">
                  Your list
                </h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {cartCount}
                </span>
              </div>

              <CartLines cart={cart} dense />

              <ReviewButton cartCount={cartCount} className="w-full" />
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Mobile sticky list bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <Sheet open={listOpen} onOpenChange={setListOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-0 flex-1 justify-between rounded-xl px-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ShoppingBasket className="size-4 shrink-0 text-primary" />
                  <span className="truncate font-medium">Your list</span>
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                  {cartCount}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] gap-0 rounded-t-2xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
              <SheetHeader className="px-0 pt-1 pb-2 text-left">
                <SheetTitle className="font-heading">Your list</SheetTitle>
                <SheetDescription>
                  {cartCount} item{cartCount === 1 ? "" : "s"} · quote on
                  WhatsApp at checkout
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 pt-1">
                <CartLines cart={cart} dense />
                <ReviewButton
                  cartCount={cartCount}
                  className="h-11 w-full"
                />
              </div>
            </SheetContent>
          </Sheet>

          <ReviewButton cartCount={cartCount} className="h-11 shrink-0 px-4" />
        </div>
      </div>
    </>
  );
}
