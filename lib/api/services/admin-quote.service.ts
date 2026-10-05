import { apiClient } from "@/lib/api/client";
import { CreateQuoteInput } from "@/lib/validations/quote";

export type AdminQuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceKobo: number;
  totalKobo: number;
};

export type AdminQuote = {
  id: string;
  quoteNumber: string;

  request: {
    id: string;
    reference: string;
  } | null;

  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;

  items: AdminQuoteItem[];

  subtotalKobo: number;
  discountKobo: number;
  taxRate: number;
  taxKobo: number;
  totalKobo: number;

  terms: string;

  status: "draft" | "sent" | "accepted" | "declined" | "expired";

  sentAt?: string;
  expiresAt?: string;
  acceptedAt?: string;
  declinedAt?: string;

  createdAt: string;
  updatedAt: string;
};

type AdminQuotesResponse = {
  quotes: AdminQuote[];
};

type AdminQuoteResponse = {
  quote: AdminQuote;
};

export async function getAdminQuotes(): Promise<AdminQuote[]> {
  const response = await apiClient.get<AdminQuotesResponse>("/admin/quotes");

  return response.data.quotes;
}

export async function getAdminQuote(id: string): Promise<AdminQuote> {
  const response = await apiClient.get<AdminQuoteResponse>(
    `/admin/quotes/${encodeURIComponent(id)}`,
  );

  return response.data.quote;
}
export async function createQuote(
  input: CreateQuoteInput,
): Promise<AdminQuote> {
  const response = await apiClient.post<AdminQuoteResponse>(
    "/admin/quotes",
    input,
  );

  return response.data.quote;
}
