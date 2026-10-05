import {
  acceptCustomerQuote,
  declineCustomerQuote,
  getCustomerQuote,
} from "@/lib/api/services/quote.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const quoteKeys = {
  all: ["quotes"] as const,

  customer: (reference: string) =>
    [...quoteKeys.all, "customer", reference] as const,
};

export function useCustomerQuote(reference: string, enabled = true) {
  return useQuery({
    queryKey: quoteKeys.customer(reference),
    queryFn: () => getCustomerQuote(reference),
    enabled: enabled && !!reference,
  });
}

export function useAcceptCustomerQuote(reference: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => acceptCustomerQuote(reference),

    onSuccess: (quote) => {
      queryClient.setQueryData(quoteKeys.customer(reference), quote);

      queryClient.invalidateQueries({
        queryKey: ["request-status", reference],
      });
    },
  });
}

export function useDeclineCustomerQuote(reference: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => declineCustomerQuote(reference),

    onSuccess: (quote) => {
      queryClient.setQueryData(quoteKeys.customer(reference), quote);

      queryClient.invalidateQueries({
        queryKey: ["request-status", reference],
      });
    },
  });
}
