import { createHash } from "node:crypto";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { PasswordResetToken } from "@/server/models/PasswordResetToken";
import { User } from "@/server/models/User";
import { Session } from "@/server/models/Session";

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  password: z.string().min(8).max(128).regex(/[A-Z]/).regex(/\d/),
});

export async function resetPassword(token: string, password: string) {
  const parsed = resetPasswordSchema.safeParse({ token, password });
  if (!parsed.success) throw new Error("Enter a valid token and a password with at least 8 characters, one uppercase letter and one number.");
  const passwordHash = await hashPassword(password);
  const reset = await PasswordResetToken.findOneAndUpdate({
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: { $gt: new Date() },
    usedAt: { $exists: false },
    userId: { $exists: true },
  }, { $set: { usedAt: new Date() } }, { new: true });
  if (!reset) throw new Error("This password reset link is invalid or expired.");
  const result = await User.updateOne({ _id: reset.userId, active: true }, { $set: { passwordHash, mustChangePassword: false } });
  if (!result.matchedCount) throw new Error("This password reset link is invalid or expired.");
  await Session.deleteMany({ userId: reset.userId });
  await PasswordResetToken.deleteMany({ userId: reset.userId });
}
