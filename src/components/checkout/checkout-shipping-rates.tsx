"use client";

import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import type { ShippingRate } from "@/types/shipping";
import { cn } from "@/lib/utils";

export function CheckoutShippingRates({
  rates,
  loading,
  error,
  selectedRateId,
  fallbackDeliveryFee,
  usingFallback,
  onSelect,
  onRetry,
  onUseFallback,
  disabled,
}: {
  rates: ShippingRate[];
  loading: boolean;
  error: string | null;
  selectedRateId: string | null;
  fallbackDeliveryFee: number;
  usingFallback: boolean;
  onSelect: (rateId: string) => void;
  onRetry: () => void;
  onUseFallback: () => void;
  disabled?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Delivery option</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Live carrier rates via Terminal Africa. Or use the fixed delivery
            fee.
          </p>
        </div>
        {loading ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Loading rates…
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-2">
        {error ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="text-muted-foreground">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={disabled}
                onClick={onRetry}
              >
                Try again
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                disabled={disabled}
                onClick={onUseFallback}
              >
                Use fixed fee ({formatNaira(fallbackDeliveryFee)})
              </Button>
            </div>
          </div>
        ) : null}

        {!error && !loading && rates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            No live rates right now. You can continue with the fixed delivery
            fee ({formatNaira(fallbackDeliveryFee)}).
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                disabled={disabled}
                onClick={onUseFallback}
              >
                Use fixed fee
              </Button>
            </div>
          </div>
        ) : null}

        {rates.map((rate) => {
          const active = !usingFallback && selectedRateId === rate.rateId;
          return (
            <button
              key={rate.rateId}
              type="button"
              disabled={disabled || loading}
              onClick={() => onSelect(rate.rateId)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "border-border/80 hover:border-primary/40",
              )}
            >
              <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                {rate.carrierLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rate.carrierLogo}
                    alt=""
                    className="size-full object-contain p-1.5"
                  />
                ) : (
                  <Truck className="size-4 text-muted-foreground" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {rate.carrierName}
                  </span>
                  <span className="font-heading font-semibold text-primary">
                    {formatNaira(rate.amount)}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {[rate.deliveryTime, rate.pickupTime]
                    .filter(Boolean)
                    .join(" · ") || "Carrier delivery"}
                </span>
              </span>
            </button>
          );
        })}

        <button
          type="button"
          disabled={disabled || loading}
          onClick={onUseFallback}
          className={cn(
            "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
            usingFallback
              ? "border-primary bg-primary/5"
              : "border-border/80 hover:border-primary/40",
          )}
        >
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Truck className="size-4 text-muted-foreground" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-foreground">
                Fixed delivery fee
              </span>
              <span className="font-heading font-semibold text-primary">
                {formatNaira(fallbackDeliveryFee)}
              </span>
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Restaurant default — no Terminal booking later
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
