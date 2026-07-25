"use client";

import { Input } from "@/components/ui/input";
import {
  NIGERIA_DIAL_CODE,
  toNigeriaLocalPhone,
  toNigeriaNationalNumber,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type PhoneInputProps = {
  id?: string;
  value: string;
  onChange: (localPhone: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

/**
 * Nigeria phone field with fixed +234 country code.
 * `value` / `onChange` use local API form (08012345678).
 */
export function PhoneInput({
  id,
  value,
  onChange,
  disabled,
  required,
  placeholder = "801 234 5678",
  className,
  inputClassName,
}: PhoneInputProps) {
  const national = toNigeriaNationalNumber(value);

  return (
    <div
      className={cn(
        "flex h-8 overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:bg-input/30",
        className,
      )}
    >
      <div
        className="flex shrink-0 items-center gap-1.5 border-r border-input bg-muted/40 px-2.5 text-sm"
        title="Nigeria"
        aria-hidden
      >
        <span className="font-semibold tracking-wide text-muted-foreground">
          NG
        </span>
        <span className="font-medium text-foreground">+{NIGERIA_DIAL_CODE}</span>
      </div>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={national}
        aria-label="Nigerian phone number"
        className={cn(
          "h-full rounded-none border-0 bg-transparent shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent",
          inputClassName,
        )}
        onChange={(event) => {
          const raw = event.target.value.replace(/[^\d\s]/g, "");
          onChange(toNigeriaLocalPhone(raw));
        }}
      />
    </div>
  );
}
