import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth/password";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/server/db/connect";
import { User } from "@/server/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    if (!email) {
      return NextResponse.json(
        { message: "Please enter your email address." },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Please enter your password." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email }).select("+passwordHash").lean();

    if (!user) {
      return NextResponse.json(
        { message: "No account was found with this email address." },
        { status: 401 },
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { message: "Your account is inactive. Please contact support." },
        { status: 403 },
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { message: "This account does not have a valid password." },
        { status: 401 },
      );
    }

    const validPassword = await verifyPassword(password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { message: "The password you entered is incorrect." },
        { status: 401 },
      );
    }

    await createSession(user._id.toString());
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unable to start your session. Please try again." },
        { status: 500 },
      );
    }

    const redirect = user.mustChangePassword
      ? "/change-password"
      : user.role === "admin"
        ? "/admin"
        : user.role === "staff"
          ? "/staff"
          : "/dashboard";

    return NextResponse.json({
      user: {
        ...currentUser,
        mustChangePassword: user.mustChangePassword,
      },
      redirect,
    });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);

    return NextResponse.json(
      { message: "Unable to log in right now. Please try again." },
      { status: 500 },
    );
  }
}
