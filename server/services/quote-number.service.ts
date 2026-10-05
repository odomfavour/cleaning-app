import crypto from "crypto";

export function generateQuoteNumber(): string {
  const date = new Date();

  const year = date.getUTCFullYear();

  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  const random = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `Q-${year}${month}-${random}`;
}
