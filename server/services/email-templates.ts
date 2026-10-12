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

type EmailHighlight = { label: string; value: string; code?: boolean };

function message(subject: string, paragraphs: string[], link?: string, label = "View your request", highlight?: EmailHighlight) {
  const text = [...paragraphs, ...(link ? [`${label}: ${link}`] : [])].join("\n\n");
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background-color:#eef5f9;font-family:Arial,Helvetica,sans-serif;color:#334155;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(subject)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef5f9;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid #d9e8f1;border-radius:16px;overflow:hidden;">
        <tr><td bgcolor="#0a3d5c" style="padding:28px 24px;background-color:#0a3d5c;border-radius:16px 16px 0 0;">
          <p style="margin:0;color:#ffffff;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-1px;">Cleanin<span style="color:#a8d8ee;">.</span></p>
          <p style="margin:6px 0 0;color:#d9e8f1;font-size:12px;line-height:18px;letter-spacing:2px;text-transform:uppercase;">Professional cleaning services</p>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h1 style="margin:0 0 24px;color:#0a3d5c;font-size:26px;line-height:34px;font-weight:700;overflow-wrap:anywhere;">${escapeHtml(subject)}</h1>
          ${paragraphs.map((paragraph) => `<p style="margin:0 0 16px;font-size:16px;line-height:26px;overflow-wrap:anywhere;">${escapeHtml(paragraph)}</p>`).join("")}
          ${highlight ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background-color:#eef5f9;border:1px solid #d9e8f1;border-radius:10px;"><tr><td align="${highlight.code ? "center" : "left"}" style="padding:20px;"><p style="margin:0 0 8px;color:#526879;font-size:12px;line-height:18px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(highlight.label)}</p><p style="margin:0;color:#0a3d5c;font-size:${highlight.code ? "32" : "24"}px;line-height:40px;font-weight:700;${highlight.code ? "font-family:Consolas,monospace;letter-spacing:4px;" : ""}overflow-wrap:anywhere;">${escapeHtml(highlight.value)}</p></td></tr></table>` : ""}
          ${link ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 24px;"><tr><td align="center" bgcolor="#0a3d5c" style="border-radius:8px;background-color:#0a3d5c;mso-padding-alt:14px 24px;"><a href="${escapeHtml(link)}" style="display:inline-block;padding:14px 24px;border:1px solid #0a3d5c;border-radius:8px;color:#ffffff;font-size:16px;line-height:22px;font-weight:700;text-decoration:none;">${escapeHtml(label)}</a></td></tr></table><p style="margin:0;color:#64748b;font-size:12px;line-height:20px;">Button not working? Copy this link into your browser:</p><p style="margin:6px 0 0;font-size:12px;line-height:20px;word-break:break-all;overflow-wrap:anywhere;"><a href="${escapeHtml(link)}" style="color:#0a3d5c;text-decoration:underline;">${escapeHtml(link)}</a></p>` : ""}
        </td></tr>
        <tr><td style="padding:24px;border-top:1px solid #d9e8f1;background-color:#f8fafc;border-radius:0 0 16px 16px;">
          <p style="margin:0;color:#0a3d5c;font-size:14px;line-height:22px;font-weight:700;">A cleaner space. One less thing to worry about.</p>
          <p style="margin:8px 0 0;color:#64748b;font-size:12px;line-height:20px;">This is a service email from Cleanin. Keep verification codes and password reset links private.</p>
        </td></tr>
      </table>
      <p style="margin:20px 0 0;color:#64748b;font-size:12px;line-height:20px;">&copy; ${new Date().getUTCFullYear()} Cleanin Cleaning Services</p>
    </td></tr>
  </table>
</body>
</html>`;
  return { subject, text, html };
}

export function requestReceivedEmail(input: { name: string; reference: string }) {
  return message("We've received your cleaning request", [
    `Hi ${input.name},`, `Your cleaning request ${input.reference} has been received. We'll review it and contact you with the next steps.`,
  ], appLink(`/request/${encodeURIComponent(input.reference)}`), "Track your request", { label: "Request reference", value: input.reference });
}

export function verificationEmail(code: string) {
  return message("Your Cleanin verification code", [`Your verification code is ${code}.`, "It expires in 10 minutes. Do not share this code with anyone."], undefined, undefined, { label: "Your verification code", value: code, code: true });
}

export function passwordResetEmail(token: string) {
  return message("Reset your Cleanin password", ["You requested a password reset. Use the link below to choose a new password.", "This link expires in 30 minutes. If you didn't request this, you can ignore this email."], appLink(`/reset-password?token=${encodeURIComponent(token)}`), "Reset password");
}

export function quoteEmail(input: { reference: string; quoteNumber: string; totalKobo: number; expiresAt: Date }) {
  return message(`Your Cleanin quote ${input.quoteNumber}`, [
    `Your quote for request ${input.reference} is ready.`,
    `Total: NGN ${(input.totalKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}. Valid until ${input.expiresAt.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" })}.`,
    "View your request to review the quote and make payment.",
  ], appLink(`/request/${encodeURIComponent(input.reference)}`), "Review your quote", { label: "Quote total", value: `NGN ${(input.totalKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}` });
}

export function bookingConfirmedEmail(input: { reference: string; bookingNumber: string; amountKobo: number }) {
  return message(`Booking confirmed: ${input.bookingNumber}`, [
    `Your payment of NGN ${(input.amountKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })} has been received.`,
    `Your cleaning booking ${input.bookingNumber} is confirmed. We'll contact you about scheduling.`,
  ], appLink(`/request/${encodeURIComponent(input.reference)}`), "View your booking", { label: "Booking confirmed", value: input.bookingNumber });
}
