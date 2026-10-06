import { apiClient } from "@/lib/api/client";
import type { Address } from "@/lib/types";

export type CustomerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  addresses?: Address[];
};

export async function getCustomerProfile(): Promise<CustomerProfile> {
  const response = await apiClient.get<{ profile: CustomerProfile }>(
    "/customer/profile",
  );
  return response.data.profile;
}

export async function updateCustomerProfile(input: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<CustomerProfile> {
  const response = await apiClient.patch<{ profile: CustomerProfile }>(
    "/customer/profile",
    input,
  );
  return response.data.profile;
}

export async function updateCustomerPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post("/customer/profile/password", input);
}
