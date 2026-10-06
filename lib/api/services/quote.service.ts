import { apiClient } from "@/lib/api/client";

export type CustomerQuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceKobo: number;
  totalKobo: number;
};

export type CustomerQuote = {
  id: string;
  quoteNumber: string;
  requestReference: string;
  items: CustomerQuoteItem[];
  subtotalKobo: number;
  discountKobo: number;
  totalKobo: number;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  sentAt?: string;
  expiresAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
};

export type CustomerQuoteDetails = {
  quote: CustomerQuote;
  request: {
    services: string[];
    address: string;
    preferredDate?: string;
    preferredTimeSlot: string;
  };
  booking: {
    id: string;
    bookingNumber: string;
    status: string;
    confirmedAt: string;
  } | null;
  paymentStatus: "success" | null;
};

export async function getCustomerQuoteById(
  id: string,
): Promise<CustomerQuoteDetails> {
  const response = await apiClient.get<CustomerQuoteDetails>(
    `/customer/quotes/${encodeURIComponent(id)}`,
  );

  return response.data;
}

export async function respondToCustomerQuote(
  id: string,
  action: "accept" | "decline",
): Promise<void> {
  await apiClient.patch(`/customer/quotes/${encodeURIComponent(id)}`, {
    action,
  });
}

type QuoteResponse = {
  quote: CustomerQuote | null;
};

export async function getCustomerQuote(
  reference: string,
): Promise<CustomerQuote | null> {
  const response = await apiClient.get<QuoteResponse>(
    `/cleaning-requests/${encodeURIComponent(reference)}/quote`,
  );

  return response.data.quote;
}

type QuoteActionResponse = {
  quote: CustomerQuote;
};

export async function acceptCustomerQuote(
  reference: string,
): Promise<CustomerQuote> {
  const response = await apiClient.post<QuoteActionResponse>(
    `/cleaning-requests/${encodeURIComponent(reference)}/quote/accept`,
  );

  return response.data.quote;
}

export async function declineCustomerQuote(
  reference: string,
): Promise<CustomerQuote> {
  const response = await apiClient.post<QuoteActionResponse>(
    `/cleaning-requests/${encodeURIComponent(reference)}/quote/decline`,
  );

  return response.data.quote;
}
