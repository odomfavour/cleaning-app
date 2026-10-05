export type QuoteCalculationItem = {
  id?: string;
  description: string;
  amount: number;
};

export type QuoteTotals = {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  total: number;
};

export function quoteTotals(input: {
  items: QuoteCalculationItem[];
  discount?: number;
  taxRate?: number;
}): QuoteTotals {
  const subtotal = input.items.reduce(
    (sum, item) => sum + Math.max(0, Number(item.amount) || 0),
    0,
  );

  const discount = Math.min(Math.max(0, Number(input.discount) || 0), subtotal);

  const taxableAmount = Math.max(0, subtotal - discount);

  const taxRate = Math.max(0, Math.min(100, Number(input.taxRate) || 0));

  const tax = Math.round((taxableAmount * taxRate) / 100);

  const total = taxableAmount + tax;

  return {
    subtotal,
    discount,
    taxableAmount,
    tax,
    total,
  };
}
