"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Home,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { AddressFormDialog } from "@/components/account/address-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSavedAddress } from "@/lib/account-address";
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";
import {
  clearCustomerSession,
  getCustomerToken,
} from "@/lib/auth/storage";
import type { SavedAddress } from "@/types/account";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AddressesManager() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) {
      router.replace("/login?next=/account");
      return;
    }

    setLoading(true);
    try {
      const data = await getAddresses(token, { page: 1, limit: 50 });
      setAddresses(data.items);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearCustomerSession();
        router.replace("/login?next=/account");
        return;
      }
      toast.error(
        error instanceof ApiError ? error.message : "Could not load addresses",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(address: SavedAddress) {
    setEditing(address);
    setDialogOpen(true);
  }

  async function makeDefault(address: SavedAddress) {
    const token = getCustomerToken();
    if (!token || address.isDefault) return;

    setBusyId(address.id);
    try {
      await setDefaultAddress(token, address.id);
      toast.success("Default address updated");
      await load();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Could not set default address",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(address: SavedAddress) {
    const token = getCustomerToken();
    if (!token) return;
    if (!window.confirm(`Delete ${address.label || "this address"}?`)) return;

    setBusyId(address.id);
    try {
      await deleteAddress(token, address.id);
      toast.success("Address deleted");
      setAddresses((prev) => prev.filter((item) => item.id !== address.id));
      await load();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not delete address",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">
              Saved addresses
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Reuse these quickly at checkout.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="rounded-xl"
            onClick={openCreate}
          >
            <Plus className="size-4" />
            Add address
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3 p-4 sm:p-5">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="px-4 py-12 text-center sm:px-5">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Home className="size-5" />
            </div>
            <p className="mt-4 font-medium text-foreground">No saved addresses</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add one so checkout is faster next time.
            </p>
            <Button className="mt-5 rounded-xl" onClick={openCreate}>
              <Plus className="size-4" />
              Add your first address
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {address.label || "Address"}
                    </p>
                    {address.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        <Star className="size-3" />
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    <span>{formatSavedAddress(address)}</span>
                  </p>
                  {address.phone ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Phone: {address.phone}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={busyId === address.id}
                      onClick={() => void makeDefault(address)}
                    >
                      Set default
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    disabled={busyId === address.id}
                    onClick={() => openEdit(address)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive",
                    )}
                    disabled={busyId === address.id}
                    onClick={() => void remove(address)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AddressFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={() => {
          void load();
        }}
      />
    </Card>
  );
}
