import {
  getCustomerPayment,
  initializeCustomerQuotePayment,
  verifyCustomerPayment,
} from "@/lib/api/services/payment.service";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const paymentKeys = {
  all: ["payments"] as const,

  customer: (reference: string) =>
    [...paymentKeys.all, "customer", reference] as const,
};

export function useCustomerPayment(reference: string, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.customer(reference),
    queryFn: () => getCustomerPayment(reference),
    enabled: enabled && !!reference,
  });
}

export function useInitializeCustomerPayment(reference: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => initializeCustomerQuotePayment(reference),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.customer(reference),
      });
    },
  });
}

export function useVerifyCustomerPayment(reference: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => verifyCustomerPayment(reference),

    onSuccess: (paymentStatus) => {
      queryClient.setQueryData(paymentKeys.customer(reference), paymentStatus);

      queryClient.invalidateQueries({
        queryKey: ["request-status", reference],
      });
    },
  });
}
