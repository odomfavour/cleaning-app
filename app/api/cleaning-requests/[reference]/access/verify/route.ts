import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { CleaningRequest, RequestAccessCode } from "@/server/models";

import { connectToDatabase } from "@/server/db/connect";

import {
  createRequestAccessToken,
  REQUEST_ACCESS_COOKIE_NAME,
  REQUEST_ACCESS_TOKEN_TTL,
} from "@/server/auth/request-access";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

type VerifyBody = {
  code?: string;
};

function hashCode(code: string) {
  return createHash("sha256").update(code).digest();
}

function safeCompareCode(submittedCode: string, storedHash: string) {
  try {
    const submittedHash = hashCode(submittedCode);
    const expectedHash = Buffer.from(storedHash, "hex");

    if (submittedHash.length !== expectedHash.length) {
      return false;
    }

    return timingSafeEqual(submittedHash, expectedHash);
  } catch {
    return false;
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { reference } = await context.params;

    const body = (await request.json()) as VerifyBody;

    const code = body.code?.trim();

    if (!code || !/^\d{6}$/.test(code)) {
      return Response.json(
        { error: "Enter the 6-digit verification code." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const cleaningRequest = await CleaningRequest.findOne({
      reference: reference.trim(),
    }).select("_id customerId");

    if (!cleaningRequest) {
      return Response.json(
        { error: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const accessCode = await RequestAccessCode.findOne({
      requestId: cleaningRequest._id,
      verifiedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!accessCode) {
      return Response.json(
        {
          error:
            "That verification code has expired. Please request a new code.",
        },
        { status: 400 },
      );
    }

    if (accessCode.attempts >= 5) {
      return Response.json(
        {
          error: "Too many verification attempts. Please request a new code.",
        },
        { status: 429 },
      );
    }

    const valid = safeCompareCode(code, accessCode.codeHash);

    if (!valid) {
      accessCode.attempts += 1;
      await accessCode.save();

      const attemptsRemaining = Math.max(0, 5 - accessCode.attempts);

      return Response.json(
        {
          error:
            attemptsRemaining > 0
              ? "That code isn't right. Check the code and try again."
              : "Too many verification attempts. Please request a new code.",
        },
        { status: attemptsRemaining > 0 ? 400 : 429 },
      );
    }

    accessCode.verifiedAt = new Date();
    await accessCode.save();

    const token = createRequestAccessToken(
      cleaningRequest._id.toString(),
      cleaningRequest.customerId.toString(),
    );

    const cookieStore = await cookies();

    cookieStore.set(REQUEST_ACCESS_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REQUEST_ACCESS_TOKEN_TTL,
    });

    return Response.json({
      verified: true,
    });
  } catch (error) {
    console.error(
      "POST /api/cleaning-requests/[reference]/access/verify failed:",
      error,
    );

    return Response.json(
      { error: "Unable to verify the request." },
      { status: 500 },
    );
  }
}
