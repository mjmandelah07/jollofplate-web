export type BusinessHours = {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
  timezone?: string;
  week?: Array<{
    day: string;
    label: string;
    open: string;
    close: string;
    closed: boolean;
  }>;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  [key: string]: string | undefined;
};

export type RestaurantSettings = {
  id: string;
  restaurantName: string;
  whatsappNumber: string;
  contactNumber: string;
  email: string;
  address: string;
  businessHours: BusinessHours;
  deliveryFee: number;
  socialLinks: SocialLinks | null;
  pickupLine1?: string | null;
  pickupLine2?: string | null;
  pickupCity?: string | null;
  pickupState?: string | null;
  pickupZip?: string | null;
  pickupCountry?: string | null;
  pickupPhone?: string | null;
  pickupEmail?: string | null;
  pickupFirstName?: string | null;
  pickupLastName?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  role: "customer" | "admin";
  emailVerified?: boolean;
};

/** The API nests the profile under `admin`, `customer`, or `user` depending on the endpoint. */
export type RawAuthResponse = {
  accessToken?: string;
  admin?: AuthUser;
  customer?: AuthUser;
  user?: AuthUser;
  message?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
  message?: string;
};

export type VerifyEmailResponse = {
  message: string;
  customer: AuthUser;
};
