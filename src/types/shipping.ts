export type ShippingRate = {
  rateId: string;
  amount: number;
  currency: string;
  carrierName: string;
  carrierSlug?: string;
  carrierLogo?: string | null;
  deliveryTime?: string | null;
  pickupTime?: string | null;
  pickupAddressId?: string;
  deliveryAddressId?: string;
  parcelId?: string;
};

export type ShippingRatesResponse = {
  currency: string;
  mode?: string;
  fallbackDeliveryFee: number;
  rates: ShippingRate[];
};

export type TerminalStatus = {
  configured: boolean;
  mode?: string | null;
  baseUrl?: string | null;
  ok: boolean;
  message?: string | null;
  carriersSample?: number;
};

export type TerminalCarrier = {
  id?: string;
  name?: string;
  slug?: string;
  logo?: string | null;
  active?: boolean;
  [key: string]: unknown;
};

export type TerminalPackaging = {
  id?: string;
  name?: string;
  type?: string;
  [key: string]: unknown;
};
