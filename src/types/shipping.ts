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
  totalWeightKg?: number;
  packagingId?: string | null;
  rates: ShippingRate[];
};

export type TerminalStatus = {
  configured: boolean;
  mode?: string | null;
  baseUrl?: string | null;
  ok: boolean;
  message?: string | null;
  publicKeyPrefix?: string | null;
  carriersSample?: number;
};

export type TerminalCarrier = {
  carrier_id?: string;
  name?: string;
  slug?: string;
  logo?: string | null;
  active?: boolean;
  domestic?: boolean;
  international?: boolean;
  regional?: boolean;
  pickup_available?: boolean;
  available_countries?: string[];
  available_countries_local?: string[];
};

export type TerminalPackaging = {
  id?: string;
  packaging_id?: string;
  name?: string;
  type?: string;
  default?: boolean;
  height?: number;
  length?: number;
  width?: number;
  weight?: number;
  size_unit?: string;
  weight_unit?: string;
};
