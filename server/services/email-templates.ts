function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function appLink(path: string) {
  const base = process.env.APP_URL;
  if (!base) throw new Error("APP_URL must be configured for email links.");
  const url = new URL(base);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("APP_URL must be an HTTP(S) URL.");
  return new URL(path, url).toString();
}

function message(subject: string, paragraphs: string[], link?: string, label = "View your request") {
  const text = [...paragraphs, ...(link ? [`${label}: ${link}`] : [])].join("\n\n");
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172b24"><h1>Cleanin</h1>${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${link ? `<p><a href="${escapeHtml(link)}">${escapeHtml(label)}</a></p>` : ""}</div>`;
  return { subject, text, html };
}

export function requestReceivedEmail(input: { name: string; reference: string }) {
  return message("We've received your cleaning request", [
    `Hi ${input.name},`, `Your cleaning request ${input.reference} has been received. We'll review it and contact you with the next steps.`,
  ], appLink(`/request/${encodeURIComponent(input.reference)}`));
}

export function verificationEmail(code: string) {
  return message("Your Cleanin verification code", [`Your verification code is ${code}.`, "It expires in 10 minutes. Do not share this code with anyone."]);
}

export function passwordResetEmail(token: string) {
  return message("Reset your Cleanin password", ["You requested a password reset. Use the link below to choose a new password.", "This link expires in 30 minutes. If you didn't request this, you can ignore this email."], appLink(`/reset-password?token=${encodeURIComponent(token)}`), "Reset password");
}

export function quoteEmail(input: { reference: string; quoteNumber: string; totalKobo: number; expiresAt: Date }) {
  return message(`Your Cleanin quote ${input.quoteNumber}`, [
    `Your quote for request ${input.reference} is ready.`,
    `Total: NGN ${(input.totalKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}. Valid until ${input.expiresAt.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}.`,
    "View your request to review the quote and make payment.",
  ], appLink(`/request/${encodeURIComponent(input.reference)}`));
}

export function bookingConfirmedEmail(input: { reference: string; bookingNumber: string; amountKobo: number }) {
  return message(`Booking confirmed: ${input.bookingNumber}`, [
    `Your payment of NGN ${(input.amountKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })} has been received.`,
    `Your cleaning booking ${input.bookingNumber} is confirmed. We'll contact you about scheduling.`,
  ], appLink(`/request/${encodeURIComponent(input.reference)}`));
}
