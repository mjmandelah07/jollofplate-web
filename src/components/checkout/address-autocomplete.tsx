"use client";

import { MapPin } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DeliveryAddressInput } from "@/types/admin";

/** Ikorodu / Lagos bias for suggestions */
const LAGOS_CENTER = { lat: 6.6194, lng: 3.5105 };

type ParsedAddress = Pick<DeliveryAddressInput, "line1" | "city" | "state">;

type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  town?: string;
  locality?: string;
  district?: string;
  county?: string;
  state?: string;
  country?: string;
  postcode?: string;
  osm_id?: number;
  osm_type?: string;
  type?: string;
};

type PhotonFeature = {
  properties: PhotonProperties;
};

type Suggestion = {
  id: string;
  primary: string;
  secondary: string;
  parsed: ParsedAddress;
};

function parsePhotonFeature(feature: PhotonFeature): Suggestion {
  const props = feature.properties;
  const line1 =
    [props.housenumber, props.street].filter(Boolean).join(" ") ||
    props.name ||
    props.street ||
    "";

  const city =
    props.city ||
    props.town ||
    props.locality ||
    props.district ||
    props.county ||
    "Ikorodu";

  const state = props.state || "Lagos";

  const secondary = [city, state, props.country]
    .filter(Boolean)
    .filter((part, index, list) => list.indexOf(part) === index)
    .join(", ");

  return {
    id: `${props.osm_type || "n"}-${props.osm_id || line1}-${secondary}`,
    primary: line1 || secondary,
    secondary,
    parsed: {
      line1: line1 || secondary,
      city,
      state,
    },
  };
}

async function searchAddresses(query: string, signal: AbortSignal) {
  const params = new URLSearchParams({
    q: query,
    limit: "6",
    lang: "en",
    lat: String(LAGOS_CENTER.lat),
    lon: String(LAGOS_CENTER.lng),
  });

  // Photon (Komoot) — free OpenStreetMap geocoder, no API key.
  const response = await fetch(
    `https://photon.komoot.io/api/?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Address search failed");
  }

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const features = Array.isArray(data.features) ? data.features : [];

  // Prefer Nigeria results when Photon returns mixed countries.
  const nigeria = features.filter((feature) => {
    const country = feature.properties.country?.toLowerCase() || "";
    return !country || country.includes("nigeria");
  });

  return (nigeria.length ? nigeria : features).map(parsePhotonFeature);
}

export function AddressLineAutocomplete({
  value,
  onChange,
  onSelect,
  disabled,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (parsed: ParsedAddress) => void;
  disabled?: boolean;
  className?: string;
}) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      void searchAddresses(query, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setOpen(true);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  function pickSuggestion(suggestion: Suggestion) {
    onSelect(suggestion.parsed);
    setSuggestions([]);
    setOpen(false);
  }

  const showList = open && suggestions.length > 0;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="delivery-line1"
          autoComplete="street-address"
          disabled={disabled}
          value={value}
          placeholder="Start typing your street or estate…"
          className="h-11 rounded-xl pl-9"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
        />
      </div>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-popover py-1 shadow-lg"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} role="option">
              <button
                type="button"
                className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm hover:bg-muted"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pickSuggestion(suggestion)}
              >
                <span className="font-medium text-foreground">
                  {suggestion.primary}
                </span>
                {suggestion.secondary ? (
                  <span className="text-xs text-muted-foreground">
                    {suggestion.secondary}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-1.5 text-xs text-muted-foreground">
        {loading
          ? "Searching addresses…"
          : "Free OpenStreetMap suggestions — pick one, then adjust apartment / landmark below."}
      </p>
    </div>
  );
}
