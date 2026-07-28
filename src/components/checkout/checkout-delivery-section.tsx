"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AddressFields,
  type AddressFormState,
} from "@/components/account/address-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  emptyAddressForm,
  formatSavedAddress,
  normalizeAddressPayload,
  savedAddressToDelivery,
} from "@/lib/account-address";
import { createAddress, getAddresses } from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";
import { getCustomerToken, getCustomerUser } from "@/lib/auth/storage";
import {
  DEFAULT_DELIVERY_ADDRESS,
  getSavedDeliveryAddress,
  saveDeliveryAddress,
} from "@/lib/cart";
import type { SavedAddress } from "@/types/account";
import type { DeliveryAddressInput } from "@/types/admin";
import { cn } from "@/lib/utils";

type Mode = "saved" | "new";

type CustomerProfile = {
  phone?: string | null;
};

export function CheckoutDeliverySection({
  address,
  onAddressChange,
  disabled,
}: {
  address: DeliveryAddressInput;
  onAddressChange: (next: DeliveryAddressInput) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("new");
  const [savingNew, setSavingNew] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [form, setForm] = useState<AddressFormState>(
    emptyAddressForm({
      ...getSavedDeliveryAddress(),
      isDefault: false,
    }),
  );

  const applySaved = useCallback(
    (item: SavedAddress) => {
      const next = savedAddressToDelivery(item);
      onAddressChange(next);
      saveDeliveryAddress(next);
      setSelectedId(item.id);
      setMode("saved");
    },
    [onAddressChange],
  );

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      setLoading(false);
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const data = await getAddresses(token, { page: 1, limit: 50 });
        setSaved(data.items);

        if (data.items.length > 0) {
          const preferred =
            data.items.find((item) => item.isDefault) || data.items[0];
          applySaved(preferred);
        } else {
          const local = getSavedDeliveryAddress();
          const profile = getCustomerUser<CustomerProfile>();
          const next = {
            ...DEFAULT_DELIVERY_ADDRESS,
            ...local,
            phone: local.phone || profile?.phone || "",
          };
          onAddressChange(next);
          setForm(
            emptyAddressForm({
              ...next,
              isDefault: true,
            }),
          );
          setMode("new");
        }
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Could not load saved addresses",
          );
        }
        const local = getSavedDeliveryAddress();
        onAddressChange({
          ...DEFAULT_DELIVERY_ADDRESS,
          ...local,
        });
        setMode("new");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  function startNewAddress() {
    const profile = getCustomerUser<CustomerProfile>();
    const draft = emptyAddressForm({
      line1: "",
      line2: "",
      city: DEFAULT_DELIVERY_ADDRESS.city,
      state: DEFAULT_DELIVERY_ADDRESS.state || "Lagos",
      landmark: "",
      phone: profile?.phone || "",
      isDefault: saved.length === 0,
    });
    setForm(draft);
    setSelectedId(null);
    setMode("new");
    onAddressChange({
      line1: draft.line1,
      line2: draft.line2,
      city: draft.city,
      state: draft.state,
      landmark: draft.landmark,
      phone: draft.phone,
    });
  }

  function updateForm(patch: Partial<AddressFormState>) {
    const next = { ...form, ...patch };
    const delivery = {
      line1: next.line1,
      line2: next.line2,
      city: next.city,
      state: next.state,
      landmark: next.landmark,
      phone: next.phone,
    };
    setForm(next);
    onAddressChange(delivery);
    saveDeliveryAddress(delivery);
  }

  async function saveNewAddress() {
    if (form.line1.trim().length < 3 || !form.city.trim()) {
      toast.error("Fill in street address and city before saving");
      return;
    }

    const token = getCustomerToken();
    if (!token) return;

    setSavingNew(true);
    try {
      const created = await createAddress(token, normalizeAddressPayload(form));
      setSaved((prev) => {
        const withoutDefault = created.isDefault
          ? prev.map((item) => ({ ...item, isDefault: false }))
          : prev;
        return [created, ...withoutDefault];
      });
      applySaved(created);
      toast.success("Address saved to your account");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not save address",
      );
    } finally {
      setSavingNew(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-[0_18px_50px_-40px_rgba(34,34,34,0.4)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            Delivery address
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a saved address or add a new one.
          </p>
        </div>
        {mode === "saved" || saved.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={disabled || loading}
            onClick={startNewAddress}
          >
            <Plus className="size-4" />
            Add another
          </Button>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
            <div className="h-20 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : null}

        {!loading && saved.length > 0 && mode === "saved" ? (
          <div className="space-y-2">
            {saved.map((item) => {
              const active = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => applySaved(item)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border/80 hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {active ? <Check className="size-3" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {item.label || "Address"}
                      </span>
                      {item.isDefault ? (
                        <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[11px] font-semibold">
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      <span>{formatSavedAddress(item)}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {!loading && mode === "new" ? (
          <div className="space-y-4">
            <AddressFields
              idPrefix="checkout"
              value={form}
              disabled={disabled || savingNew}
              showDefaultToggle={saved.length === 0}
              onChange={updateForm}
            />

            {getCustomerToken() ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2.5 text-sm text-foreground">
                  <Checkbox
                    checked={saveToAccount}
                    disabled={disabled || savingNew}
                    onCheckedChange={(checked) =>
                      setSaveToAccount(checked === true)
                    }
                  />
                  Save this address to my account
                </label>
                <div className="flex flex-wrap gap-2">
                  {saved.length > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      disabled={disabled || savingNew}
                      onClick={() => {
                        const preferred =
                          saved.find((item) => item.isDefault) || saved[0];
                        applySaved(preferred);
                      }}
                    >
                      Use saved address
                    </Button>
                  ) : null}
                  {saveToAccount ? (
                    <Button
                      type="button"
                      className="rounded-xl"
                      disabled={disabled || savingNew}
                      onClick={() => void saveNewAddress()}
                    >
                      {savingNew ? "Saving…" : "Save address"}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
