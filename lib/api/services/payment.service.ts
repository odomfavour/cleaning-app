import { apiClient } from "@/lib/api/client";

export type InitializeCustomerPaymentResponse = {
  payment: {
    id: string;
    reference: string;
    amountKobo: number;
    currency: "NGN";
    status: "initialized" | "success" | "failed" | "abandoned";
  };

  accessCode: string;
};

export async function initializeCustomerQuotePayment(
  reference: string,
): Promise<InitializeCustomerPaymentResponse> {
  const response = await apiClient.post<InitializeCustomerPaymentResponse>(
    `/cleaning-requests/${encodeURIComponent(reference)}/payment/initialize`,
  );

  return response.data;
}

export type CustomerPayment = {
  id: string;
  reference: string;
  quoteId: string;
  amountKobo: number;
  currency: "NGN";
  status: "initialized" | "success" | "failed" | "abandoned";
  paidAt?: string;
};

export type CustomerPaymentStatus = {
  payment: CustomerPayment | null;
  booking: {
    id: string;
    bookingNumber: string;
    status: string;
    scheduledFor?: string;
    amountKobo: number;
    confirmedAt: string;
  } | null;
};

export type CustomerPaymentVerification = Omit<
  CustomerPaymentStatus,
  "payment"
> & {
  payment: CustomerPayment;
};

export async function verifyCustomerPayment(
  requestReference: string,
): Promise<CustomerPaymentVerification> {
  const response = await apiClient.post<CustomerPaymentVerification>(
    `/cleaning-requests/${encodeURIComponent(requestReference)}/verify`,
  );

  return response.data;
}

export async function getCustomerPayment(
  requestReference: string,
): Promise<CustomerPaymentStatus> {
  const response = await apiClient.get<CustomerPaymentStatus>(
    `/cleaning-requests/${encodeURIComponent(requestReference)}/payment`,
  );

  return response.data;
}
