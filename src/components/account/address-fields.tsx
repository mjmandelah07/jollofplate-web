"use client";

import { AddressLineAutocomplete } from "@/components/checkout/address-autocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Switch } from "@/components/ui/switch";

export type AddressFormState = {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  landmark: string;
  phone: string;
  isDefault: boolean;
};

export function AddressFields({
  value,
  onChange,
  disabled,
  showDefaultToggle = true,
  idPrefix = "address",
}: {
  value: AddressFormState;
  onChange: (patch: Partial<AddressFormState>) => void;
  disabled?: boolean;
  showDefaultToggle?: boolean;
  idPrefix?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-label`}>Label</Label>
        <Input
          id={`${idPrefix}-label`}
          value={value.label}
          disabled={disabled}
          placeholder="Home, Office, Mum’s place…"
          className="h-11 rounded-xl"
          onChange={(event) => onChange({ label: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-line1`}>
          Street address <span className="text-destructive">*</span>
        </Label>
        <AddressLineAutocomplete
          id={`${idPrefix}-line1`}
          value={value.line1}
          disabled={disabled}
          onChange={(line1) => onChange({ line1 })}
          onSelect={({ line1, city, state }) =>
            onChange({ line1, city, state })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-line2`}>
          Apartment / floor{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id={`${idPrefix}-line2`}
          value={value.line2}
          disabled={disabled}
          placeholder="Flat 3B, Block A…"
          className="h-11 rounded-xl"
          onChange={(event) => onChange({ line2: event.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-city`}>
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-city`}
            value={value.city}
            disabled={disabled}
            placeholder="Ikorodu"
            className="h-11 rounded-xl"
            onChange={(event) => onChange({ city: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-state`}>
            State <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-state`}
            value={value.state}
            disabled={disabled}
            placeholder="Lagos"
            className="h-11 rounded-xl"
            onChange={(event) => onChange({ state: event.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-landmark`}>
          Landmark{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id={`${idPrefix}-landmark`}
          value={value.landmark}
          disabled={disabled}
          placeholder="Near the roundabout / bus park…"
          className="h-11 rounded-xl"
          onChange={(event) => onChange({ landmark: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-phone`}>
          Delivery phone{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <PhoneInput
          id={`${idPrefix}-phone`}
          value={value.phone}
          disabled={disabled}
          className="h-11 rounded-xl"
          inputClassName="text-base md:text-sm"
          onChange={(phone) => onChange({ phone })}
        />
      </div>

      {showDefaultToggle ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 px-3.5 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Default address
            </p>
            <p className="text-xs text-muted-foreground">
              Use this first at checkout
            </p>
          </div>
          <Switch
            checked={value.isDefault}
            disabled={disabled}
            onCheckedChange={(isDefault) => onChange({ isDefault })}
          />
        </div>
      ) : null}
    </div>
  );
}
