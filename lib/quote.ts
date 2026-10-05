import type { Quote } from "@/lib/types";
export function quoteTotals(q: Pick<Quote, "items" | "discount" | "taxRate">) {
  const subtotal = q.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const discount = Math.min(q.discount || 0, subtotal);
  const tax = Math.round(((subtotal - discount) * (q.taxRate || 0)) / 100);
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}
