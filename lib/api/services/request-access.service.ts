import { apiClient } from "@/lib/api/client";

export type VerificationChannel = "email" | "phone";

type SendCodeResponse = {
  sentTo: string;
};

type VerifyResponse = {
  verified: boolean;
};

export async function sendRequestAccessCode(
  reference: string,
  channel: VerificationChannel,
): Promise<SendCodeResponse> {
  const response = await apiClient.post<SendCodeResponse>(
    `/cleaning-requests/${encodeURIComponent(reference)}/access/send-code`,
    { channel },
  );

  return response.data;
}

export async function verifyRequestAccess(
  reference: string,
  code: string,
): Promise<VerifyResponse> {
  const response = await apiClient.post<VerifyResponse>(
    `/cleaning-requests/${encodeURIComponent(reference)}/access/verify`,
    { code },
  );

  return response.data;
}
