import { apiClient } from "@/lib/api/client";

export type AuthRole = "customer" | "admin" | "staff";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: AuthRole;
  mustChangePassword?: boolean;
  customerId?: string;
  staffProfileId?: string;
};

type LoginResponse = {
  user: AuthUser;
  redirect: string;
};

export type RegisterCustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function registerCustomer(
  input: RegisterCustomerInput,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/register", input);

  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<{ user: AuthUser }>("/auth/me");

  return response.data.user;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

