import { createQuote } from "@/lib/api/services/admin-quote.service";
import { CreateQuoteInput } from "@/lib/validations/quote";
import { useMutation } from "@tanstack/react-query";

export function useCreateQuote() {
  return useMutation({
    mutationFn: (input: CreateQuoteInput) => createQuote(input),
  });
}
