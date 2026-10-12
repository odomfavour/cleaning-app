import assert from "node:assert/strict";
import { test, afterEach, mock } from "node:test";
import { createHash } from "node:crypto";
import { PasswordResetToken } from "../server/models/PasswordResetToken";
import { Session } from "../server/models/Session";
import { User } from "../server/models/User";
import { verifyPassword } from "../lib/auth/password";

afterEach(() => mock.restoreAll());

test("password reset consumes an unexpired token once and changes the login password", async () => {
  const token = "a".repeat(64);
  mock.method(Session, "deleteMany", async () => ({ deletedCount: 1 }));
  mock.method(PasswordResetToken, "deleteMany", async () => ({ deletedCount: 1 }));
  let used = false;
  let savedHash = "";
  mock.method(PasswordResetToken, "findOneAndUpdate", async (query: Record<string, unknown>) => {
    assert.equal(query.tokenHash, createHash("sha256").update(token).digest("hex"));
    assert.deepEqual(query.usedAt, { $exists: false });
    assert.ok((query.expiresAt as { $gt: unknown }).$gt instanceof Date);
    if (used) return null;
    used = true;
    return { userId: "user-1" };
  });
  mock.method(User, "updateOne", async (query: Record<string, unknown>, update: { $set: { passwordHash: string } }) => {
    assert.equal(query._id, "user-1");
    savedHash = update.$set.passwordHash;
    return { matchedCount: 1 };
  });
  const { resetPassword } = await import("../server/services/password-reset.service");
  await resetPassword(token, "NewPassword123");
  assert.ok(await verifyPassword("NewPassword123", savedHash));
  assert.ok(!(await verifyPassword("OldPassword123", savedHash)));
  await assert.rejects(resetPassword(token, "OtherPassword123"), /invalid or expired/i);
});
