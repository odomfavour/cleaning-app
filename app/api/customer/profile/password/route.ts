import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { connectToDatabase } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { NextResponse } from "next/server";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/\d/),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user)
      return NextResponse.json({ message: "Login required." }, { status: 401 });
    if (user.role !== "customer") {
      return NextResponse.json(
        { message: "Customer access required." },
        { status: 403 },
      );
    }

    const parsed = passwordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            "Use at least 8 characters, including an uppercase letter and a number.",
        },
        { status: 400 },
      );
    }

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return NextResponse.json(
        { message: "Choose a password different from your current one." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const account = await User.findById(user.id).select("+passwordHash");

    if (!account?.passwordHash) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 },
      );
    }

    const validCurrentPassword = await verifyPassword(
      parsed.data.currentPassword,
      account.passwordHash,
    );

    if (!validCurrentPassword) {
      return NextResponse.json(
        { message: "Your current password is incorrect." },
        { status: 400 },
      );
    }

    account.passwordHash = await hashPassword(parsed.data.newPassword);
    await account.save();

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("POST /api/customer/profile/password failed:", error);
    return NextResponse.json(
      { message: "Unable to update your password." },
      { status: 500 },
    );
  }
}
