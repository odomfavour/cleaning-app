import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { Notification } from "../server/models/Notification";

const originalFetch = globalThis.fetch;
afterEach(() => { mock.restoreAll(); globalThis.fetch = originalFetch; });

// These catch false 'sent' records, provider failures being ignored, and leaked secrets.
for (const outcome of ["success", "rejected", "unconfigured"] as const) {
  test(`email delivery records ${outcome} accurately`, async () => {
    process.env.RESEND_API_KEY = outcome === "unconfigured" ? "" : "re_test";
    process.env.RESEND_FROM_EMAIL = "Cleanin <hello@example.com>";
    const record: Record<string, unknown> & { save(): Promise<void> } = { async save() {} };
    mock.method(Notification, "create", async (data: Record<string, unknown>) => { Object.assign(record, data); return record; });
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(init?.body as string);
      assert.equal(body.from, "Cleanin <hello@example.com>");
      assert.deepEqual(body.to, ["customer@example.com"]);
      assert.equal(record.status, "queued");
      return Response.json(outcome === "success" ? { id: "email-123" } : { name: "validation_error", message: "Invalid sender" }, { status: outcome === "success" ? 200 : 422 });
    };
    const { sendEmail } = await import("../server/services/email.service");
    const pending = sendEmail({ type: "verification", to: "customer@example.com", subject: "Your code", text: "123456" });
    if (outcome === "success") {
      await pending;
      assert.equal(record.status, "sent");
      assert.equal(record.providerMessageId, "email-123");
      assert.ok(record.sentAt instanceof Date);
    } else {
      await assert.rejects(pending);
      assert.equal(record.status, "failed");
      assert.equal(record.sentAt, undefined);
      assert.ok(record.failedAt instanceof Date);
    }
    assert.equal(JSON.stringify(record).includes("123456"), false);
  });
}

test("email content escapes customer input and builds encoded tracking links", async () => {
  process.env.APP_URL = "https://cleanin.example";
  const { requestReceivedEmail } = await import("../server/services/email-templates");
  const message = requestReceivedEmail({ name: '<img src=x onerror="alert(1)">', reference: "REQ/a?b" });
  assert.ok(!message.html.includes("<img"));
  assert.ok(message.html.includes("&lt;img"));
  assert.ok(message.text.includes("https://cleanin.example/request/REQ%2Fa%3Fb"));
});

test("provider acceptance remains successful when saving its receipt fails", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_FROM_EMAIL = "Cleanin <hello@example.com>";
  const states: unknown[] = [];
  const record = { status: "queued", async save() { states.push(record.status); throw new Error("database unavailable"); } };
  mock.method(Notification, "create", async () => record);
  globalThis.fetch = async () => Response.json({ id: "accepted-email" });
  const { sendEmail } = await import("../server/services/email.service");
  await assert.doesNotReject(sendEmail({ type: "verification", to: "customer@example.com", subject: "Code", text: "654321" }));
  assert.deepEqual(states, ["sent"]);
});

test("email preparation failure does not fail a persisted request", async () => {
  const { sendEmailSafely } = await import("../server/services/email.service");
  let prepared = false;
  await assert.doesNotReject(sendEmailSafely(() => { prepared = true; throw new Error("Invalid APP_URL"); }));
  assert.equal(prepared, true);
});

test("a stale queued booking delivery is reclaimed with the same provider idempotency key", async () => {
  process.env.RESEND_API_KEY = "re_test";
  process.env.RESEND_FROM_EMAIL = "Cleanin <hello@example.com>";
  mock.method(Notification, "create", async () => { throw Object.assign(new Error("duplicate"), { code: 11000 }); });
  let recovered = false;
  mock.method(Notification, "findOneAndUpdate", async (query: { $or?: { status: string }[] }) => {
    recovered = !!query.$or?.some((branch) => branch.status === "queued");
    return recovered ? { status: "queued", async save() {} } : null;
  });
  globalThis.fetch = async (_url, init) => {
    assert.equal(new Headers(init?.headers).get("Idempotency-Key"), "booking-confirmed/booking-1");
    return Response.json({ id: "recovered-email" });
  };
  const { sendEmail } = await import("../server/services/email.service");
  await sendEmail({ type: "booking_confirmed", to: "customer@example.com", subject: "Booking", text: "Confirmed", deliveryKey: "booking-confirmed/booking-1" });
  assert.equal(recovered, true);
});

test("a concurrent booking delivery skips the provider when another caller owns the claim", async () => {
  mock.method(Notification, "create", async () => { throw Object.assign(new Error("duplicate"), { code: 11000 }); });
  mock.method(Notification, "findOneAndUpdate", async () => null);
  globalThis.fetch = async () => { assert.fail("must not send a duplicate email"); };
  const { sendEmail } = await import("../server/services/email.service");
  await sendEmail({ type: "booking_confirmed", to: "customer@example.com", subject: "Booking", text: "Confirmed", deliveryKey: "booking-confirmed/booking-1" });
});
