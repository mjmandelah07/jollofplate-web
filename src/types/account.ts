export type CustomerProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: "customer" | "admin";
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedAddress = {
  id: string;
  customerId?: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  landmark?: string | null;
  phone?: string | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SavedAddressInput = {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  landmark?: string;
  phone?: string;
  isDefault?: boolean;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};
