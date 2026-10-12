import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { Types } from "mongoose";
import { CleaningRequest } from "../server/models/CleaningRequest";
import { Customer } from "../server/models/Customer";
import { Quote } from "../server/models/Quote";
import { Notification } from "../server/models/Notification";
import { createAdminQuote } from "../server/services/quote.service";

const originalFetch = globalThis.fetch;
afterEach(() => { mock.restoreAll(); globalThis.fetch = originalFetch; });

for (const failure of ["none", "provider", "template", "customer_lookup"]) {
  test(`a submitted request gets a usable quote when email failure is ${failure}`, async () => {
    process.env.APP_URL = failure === "template" ? "invalid-url" : "https://cleanin.example";
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "Cleanin <hello@example.com>";
    const requestId = new Types.ObjectId("000000000000000000000001");
    const customerId = new Types.ObjectId("000000000000000000000002");
    const request = { _id: requestId, customerId, status: "submitted", reference: "REQ-123", contactSnapshot: { email: "guest@example.com" } };
    let storedStatus = "submitted";
    let providerCalls = 0;
    mock.method(CleaningRequest, "findById", () => ({ lean: async () => request }));
    mock.method(CleaningRequest, "updateOne", async (_query: unknown, update: { $set: { status: string } }) => { storedStatus = update.$set.status; });
    mock.method(Customer, "findById", () => ({ select: () => ({ lean: async () => { if (failure === "customer_lookup") throw new Error("db offline"); return { email: "account@example.com" }; } }) }));
    mock.method(Quote, "create", async (data: Record<string, unknown>) => new Quote(data));
    mock.method(Notification, "create", async () => ({ async save() {} }));
    globalThis.fetch = async (_url, init) => {
      providerCalls++;
      const body = JSON.parse(init?.body as string);
      assert.deepEqual(body.to, ["guest@example.com"]);
      assert.ok(body.text.includes("https://cleanin.example/request/REQ-123"));
      return failure === "provider" ? Response.json({ name: "validation_error", message: "Invalid sender" }, { status: 422 }) : Response.json({ id: "quote-email-1" });
    };
    const result = await createAdminQuote({ requestId: requestId.toString(), items: [{ description: "Deep cleaning", amount: 1000 }], discount: 0, taxRate: 0, validUntil: "2099-01-01", terms: "Payment confirms your booking." });
    assert.equal(result.totalKobo, 100000);
    assert.equal(result.status, "sent");
    assert.equal(storedStatus, "quoted");
    assert.equal(providerCalls, ["none", "provider"].includes(failure) ? 1 : 0);
  });
}
