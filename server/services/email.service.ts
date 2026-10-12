import { Resend } from "resend";
import { Notification } from "@/server/models/Notification";

export type EmailInput = {
  type: "verification" | "request_received" | "quote_sent" | "booking_confirmed" | "password_reset";
  to: string;
  customerId?: unknown;
  subject: string;
  text: string;
  html?: string;
  deliveryKey?: string;
  metadata?: Record<string, unknown>;
};

// Store delivery information only; never persist email bodies, OTPs or reset tokens.
export async function sendEmail(input: EmailInput) {
  let notification;
  try {
    notification = await Notification.create({
      customerId: input.customerId,
      channel: "email",
      type: input.type,
      destination: input.to,
      subject: input.subject,
      status: "queued",
      deliveryKey: input.deliveryKey,
      metadata: input.metadata,
    });
  } catch (error) {
    if (!input.deliveryKey || (error as { code?: number }).code !== 11000) throw error;
    // Reclaim failures or expired two-minute leases within Resend's 24-hour idempotency window.
    notification = await Notification.findOneAndUpdate(
      {
        deliveryKey: input.deliveryKey,
        createdAt: { $gt: new Date(Date.now() - 23 * 60 * 60 * 1000) },
        $or: [
          { status: "failed" },
          { status: "queued", updatedAt: { $lt: new Date(Date.now() - 2 * 60 * 1000) } },
        ],
      },
      { $set: { status: "queued" }, $unset: { failedAt: 1, errorMessage: 1 } },
      { new: true },
    );
    if (!notification) return;
  }

  let providerMessageId: string;
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL must be configured.");
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
      ...(process.env.RESEND_REPLY_TO_EMAIL ? { replyTo: process.env.RESEND_REPLY_TO_EMAIL } : {}),
    }, { idempotencyKey: input.deliveryKey, signal: AbortSignal.timeout(15_000) });
    if (error || !data?.id) throw new Error(error?.message ?? "Resend returned no message ID.");
    providerMessageId = data.id;
  } catch (error) {
    notification.status = "failed";
    notification.failedAt = new Date();
    notification.errorMessage = error instanceof Error ? error.message : "Email delivery failed.";
    try { await notification.save(); }
    catch { console.error("Unable to persist email delivery failure."); }
    throw error;
  }

  notification.status = "sent";
  notification.providerMessageId = providerMessageId;
  notification.sentAt = new Date();
  try { await notification.save(); }
  catch {
    // Resend already accepted the email. Keep OTPs/reset links usable; keyed sends can reconcile later.
    console.error("Email accepted by Resend, but its delivery receipt could not be saved.");
  }
}

// A persisted request/payment remains successful even if email delivery fails.
export async function sendEmailSafely(input: EmailInput | (() => EmailInput | Promise<EmailInput>)) {
  try { await sendEmail(typeof input === "function" ? await input() : input); }
  catch { console.error("Unable to prepare or send email; check configuration and notification delivery records."); }
}
