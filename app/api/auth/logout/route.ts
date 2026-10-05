import { NextResponse } from "next/server";

import { destroySession } from "@/lib/auth/session";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("POST /api/auth/logout failed:", error);

    return NextResponse.json(
      { message: "Unable to log out." },
      { status: 500 },
    );
  }
}
