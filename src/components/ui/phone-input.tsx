"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  NIGERIA_DIAL_CODE,
  toNigeriaLocalPhone,
  toNigeriaNationalNumber,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value: string;
  onChange: (localPhone: string) => void;
  inputClassName?: string;
};

/**
 * Nigeria phone field with fixed +234 country code.
 * `value` / `onChange` use local API form (08012345678).
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      id,
      value,
      onChange,
      disabled,
      required,
      placeholder = "801 234 5678",
      className,
      inputClassName,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) {
    const national = toNigeriaNationalNumber(value);

    return (
      <div
        className={cn(
          "flex h-8 overflow-hidden rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
          className,
        )}
        aria-invalid={ariaInvalid || undefined}
      >
        <div
          className="flex shrink-0 items-center gap-1.5 border-r border-input bg-muted/40 px-2.5 text-sm"
          title="Nigeria"
          aria-hidden
        >
          <span className="font-semibold tracking-wide text-muted-foreground">
            NG
          </span>
          <span className="font-medium text-foreground">
            +{NIGERIA_DIAL_CODE}
          </span>
        </div>
        <Input
          ref={ref}
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={national}
          aria-invalid={ariaInvalid}
          aria-label="Nigerian phone number"
          className={cn(
            "h-full rounded-none border-0 bg-transparent shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent",
            inputClassName,
          )}
          onChange={(event) => {
            const raw = event.target.value.replace(/[^\d\s]/g, "");
            onChange(toNigeriaLocalPhone(raw));
          }}
          {...props}
        />
      </div>
    );
  },
);
