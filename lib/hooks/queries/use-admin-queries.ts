import {
  getAdminQuote,
  getAdminQuotes,
} from "@/lib/api/services/admin-quote.service";
import { useQuery } from "@tanstack/react-query";

export const adminQuoteKeys = {
  all: ["admin", "quotes"] as const,

  detail: (id: string) => [...adminQuoteKeys.all, "detail", id] as const,
};

export function useAdminQuotes() {
  return useQuery({
    queryKey: adminQuoteKeys.all,
    queryFn: getAdminQuotes,
  });
}

export function useAdminQuote(id: string) {
  return useQuery({
    queryKey: adminQuoteKeys.detail(id),
    queryFn: () => getAdminQuote(id),
    enabled: !!id,
  });
}
