"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddressFields, type AddressFormState } from "@/components/account/address-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  emptyAddressForm,
  normalizeAddressPayload,
} from "@/lib/account-address";
import { createAddress, updateAddress } from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";
import { getCustomerToken } from "@/lib/auth/storage";
import type { SavedAddress } from "@/types/account";

export function AddressFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SavedAddress | null;
  onSaved: (address: SavedAddress) => void;
}) {
  const [form, setForm] = useState<AddressFormState>(emptyAddressForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? emptyAddressForm({
            label: editing.label || "",
            line1: editing.line1,
            line2: editing.line2 || "",
            city: editing.city,
            state: editing.state || "Lagos",
            landmark: editing.landmark || "",
            phone: editing.phone || "",
            isDefault: editing.isDefault,
          })
        : emptyAddressForm({ isDefault: false }),
    );
  }, [editing, open]);

  async function onSubmit() {
    if (form.line1.trim().length < 3) {
      toast.error("Enter a street address (at least 3 characters)");
      return;
    }
    if (!form.city.trim()) {
      toast.error("Enter a city");
      return;
    }

    const token = getCustomerToken();
    if (!token) return;

    setSaving(true);
    try {
      const body = normalizeAddressPayload(form);
      const saved = editing
        ? await updateAddress(token, editing.id, body)
        : await createAddress(token, body);
      toast.success(editing ? "Address updated" : "Address saved");
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not save address",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit address" : "Add address"}
          </DialogTitle>
          <DialogDescription>
            Save a delivery location you can reuse at checkout.
          </DialogDescription>
        </DialogHeader>

        <AddressFields
          value={form}
          disabled={saving}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void onSubmit()}
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Save address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
