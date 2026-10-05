// lib/utils/generate-booking-number.ts

import crypto from "crypto";

export function generateBookingNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const random = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `BK-${date}-${random}`;
}
