import { apiClient } from "@/lib/api/client";

export type Service = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  guidance: string;
  duration: string;
  active: boolean;
  sortOrder: number;
};

type GetServicesResponse = {
  services: Service[];
};

type ServiceResponse = {
  service: Service;
};

export async function getServices(): Promise<Service[]> {
  const response = await apiClient.get<GetServicesResponse>("/services");

  return response.data.services;
}

export async function createService(
  input: Omit<Service, "id" | "code" | "slug" | "sortOrder">,
): Promise<Service> {
  const response = await apiClient.post<ServiceResponse>("/services", input);

  return response.data.service;
}

export async function updateService(
  id: string,
  input: Partial<Omit<Service, "id" | "code" | "slug" | "sortOrder">>,
): Promise<Service> {
  const response = await apiClient.patch<ServiceResponse>(
    `/services/${id}`,
    input,
  );

  return response.data.service;
}
