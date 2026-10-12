import assert from "node:assert/strict";
import { test } from "node:test";
import { protectedPageRole, safeReturnPath } from "../lib/auth/route-access";

test("portal pages and descendants require their portal role", () => {
  for (const [path, role] of [["/dashboard", "customer"], ["/dashboard/requests/REF-123", "customer"], ["/admin/settings", "admin"], ["/staff/jobs/123", "staff"]]) {
    assert.equal(protectedPageRole(path), role);
  }
  for (const path of ["/", "/login", "/request/REF-123", "/request-cleaning", "/dashboard-other"]) {
    assert.equal(protectedPageRole(path), null);
  }
});

test("login return destinations reject external and malformed URLs", () => {
  assert.equal(safeReturnPath("/dashboard/requests/REF-123?tab=quote"), "/dashboard/requests/REF-123?tab=quote");
  for (const value of [null, "https://example.com", "//example.com", "/\\example.com", "/dashboard\n", "/%2f%2fexample.com"]) {
    assert.equal(safeReturnPath(value), null);
  }
});
