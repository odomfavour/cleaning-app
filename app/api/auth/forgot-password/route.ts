import { sendEmail } from "@/server/services/email.service";
import { passwordResetEmail } from "@/server/services/email-templates";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { User, PasswordResetToken } from "@/server/models";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const parsed = forgotPasswordSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    await connectToDatabase();

    const user = await User.findOne({ email, active: true }).lean();

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      const resetToken = await PasswordResetToken.create({
        userId: user._id,
        customerId: user.customerId,
        tokenHash,
        expiresAt,
      });

      try {
        await sendEmail({
          customerId: user.customerId,
          type: "password_reset",
          to: email,
          ...passwordResetEmail(rawToken),
        });
      } catch {
        await PasswordResetToken.deleteOne({ _id: resetToken._id });
        console.error("Password reset email failed; see notification delivery records.");
      }
    }

    // Always respond with success to avoid email enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account exists for this email, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { message: "Unable to process password reset request." },
      { status: 500 },
    );
  }
}
