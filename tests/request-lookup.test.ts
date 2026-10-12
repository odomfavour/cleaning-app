import assert from "node:assert/strict";
import { test } from "node:test";
import { requestLookup } from "../server/utils/request-lookup";

test("request lookup accepts references and legacy database IDs", () => {
  assert.deepEqual(requestLookup(" CLN-123 "), { reference: "CLN-123" });
  const id = "6abef2f8326b2efcbc7033ae";
  assert.deepEqual(requestLookup(id), { $or: [{ reference: id }, { _id: id }] });
  assert.deepEqual(requestLookup("invalid-id"), { reference: "invalid-id" });
});
