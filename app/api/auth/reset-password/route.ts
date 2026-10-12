import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { resetPassword, resetPasswordSchema } from "@/server/services/password-reset.service";

export async function POST(request: Request) {
  try {
    const parsed = resetPasswordSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ message: "Use a valid reset link and a password with at least 8 characters, one uppercase letter and one number." }, { status: 400 });
    await connectToDatabase();
    await resetPassword(parsed.data.token, parsed.data.password);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("invalid or expired")) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("Password reset failed.");
    return NextResponse.json({ message: "Unable to reset password. Please request a new link." }, { status: 500 });
  }
}
