import {
  getPublicRequestStatus,
  getVerifiedRequest,
} from "@/lib/api/services/cleaning-request-tracking.service";
import { useQuery } from "@tanstack/react-query";

export function usePublicRequestStatus(reference: string) {
  return useQuery({
    queryKey: ["cleaning-request-status", reference],
    queryFn: () => getPublicRequestStatus(reference),
    enabled: !!reference,
  });
}

export function useVerifiedRequest(reference: string, enabled: boolean) {
  return useQuery({
    queryKey: ["cleaning-request", reference],
    queryFn: () => getVerifiedRequest(reference),
    enabled: !!reference && enabled,
  });
}
