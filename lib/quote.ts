export function quoteTotals(q: {
  items?: { amount?: number; totalKobo?: number }[];
  discount?: number;
  discountKobo?: number;
  taxRate?: number;
  totalKobo?: number;
}) {
  if (typeof q.totalKobo === "number" && q.totalKobo > 0) {
    const total = q.totalKobo / 100;
    const discount = (q.discountKobo || 0) / 100;
    const subtotal =
      ((q.items || []).reduce((s, i) => s + (i.totalKobo || 0), 0) ||
        q.totalKobo) / 100;
    const tax = Math.round(((subtotal - discount) * (q.taxRate || 0)) / 100);
    return { subtotal, discount, tax, total };
  }
  const subtotal = (q.items || []).reduce(
    (s, i) =>
      s + (Number(i.amount) || (i.totalKobo ? i.totalKobo / 100 : 0) || 0),
    0,
  );
  const discount = Math.min(
    (q.discount || (q.discountKobo ? q.discountKobo / 100 : 0)) || 0,
    subtotal,
  );
  const tax = Math.round(((subtotal - discount) * (q.taxRate || 0)) / 100);
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}

