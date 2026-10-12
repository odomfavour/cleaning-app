import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { CleaningRequest } from "../server/models/CleaningRequest";
import { Customer } from "../server/models/Customer";
import { Notification } from "../server/models/Notification";
import { sendBookingConfirmation } from "../server/services/booking-email.service";

const originalFetch = globalThis.fetch;
afterEach(() => { mock.restoreAll(); globalThis.fetch = originalFetch; });

test("booking callbacks send one confirmation and retry a failed delivery", async () => {
  process.env.APP_URL = "https://cleanin.example";
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_FROM_EMAIL = "Cleanin <hello@example.com>";
  mock.method(CleaningRequest, "findById", () => ({ lean: async () => ({ reference: "REQ-1", contactSnapshot: { email: "guest@example.com" } }) }));
  mock.method(Customer, "findById", () => ({ select: () => ({ lean: async () => ({ email: "account@example.com" }) }) }));
  let notification: { status: string; save(): Promise<void> } | undefined;
  mock.method(Notification, "create", async (data: { deliveryKey: string }) => {
    assert.equal(data.deliveryKey, "booking-confirmed/booking-1");
    if (notification) throw Object.assign(new Error("duplicate"), { code: 11000 });
    notification = { status: "queued", async save() {} };
    return notification;
  });
  mock.method(Notification, "findOneAndUpdate", async () => {
    if (notification?.status !== "failed") return null;
    notification.status = "queued";
    return notification;
  });
  let providerCalls = 0;
  globalThis.fetch = async (_url, init) => {
    providerCalls++;
    assert.equal(new Headers(init?.headers).get("Idempotency-Key"), "booking-confirmed/booking-1");
    assert.deepEqual(JSON.parse(init?.body as string).to, ["guest@example.com"]);
    if (providerCalls === 1) return Response.json({ name: "application_error", message: "temporarily unavailable" }, { status: 500 });
    return Response.json({ id: "booking-email-1" });
  };
  const booking = { _id: "booking-1", requestId: "request-1", customerId: "customer-1", bookingNumber: "BK-123", amountKobo: 100000 };
  await sendBookingConfirmation(booking);
  assert.equal(notification?.status, "failed");
  await sendBookingConfirmation(booking);
  assert.equal(notification?.status, "sent");
  await sendBookingConfirmation(booking);
  assert.equal(providerCalls, 2);
});
