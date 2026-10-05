import { randomInt, createHash } from "node:crypto";

import { CleaningRequest, RequestAccessCode } from "@/server/models";
import { connectToDatabase } from "@/server/db/connect";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

type SendCodeBody = {
  channel?: "email" | "phone";
};

function maskEmail(email?: string) {
  if (!email) return "";

  const [local, domain] = email.split("@");

  if (!local || !domain) {
    return "***";
  }

  if (local.length <= 2) {
    return `${local[0] ?? "*"}***@${domain}`;
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone?: string) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length <= 4) {
    return "***";
  }

  return `***${digits.slice(-4)}`;
}

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { reference } = await context.params;

    const body = (await request.json()) as SendCodeBody;

    if (body.channel !== "email" && body.channel !== "phone") {
      return Response.json(
        { error: "Invalid verification channel." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const cleaningRequest = await CleaningRequest.findOne({
      reference: reference.trim(),
    }).select("_id contactSnapshot");

    if (!cleaningRequest) {
      return Response.json(
        { error: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const email = cleaningRequest.contactSnapshot?.email;
    const phone = cleaningRequest.contactSnapshot?.phone;

    if (body.channel === "email" && !email) {
      return Response.json(
        { error: "No email address is available for this request." },
        { status: 400 },
      );
    }

    if (body.channel === "phone" && !phone) {
      return Response.json(
        { error: "No phone number is available for this request." },
        { status: 400 },
      );
    }

    const code = randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Expire previous unverified codes for this request.
    await RequestAccessCode.updateMany(
      {
        requestId: cleaningRequest._id,
        verifiedAt: { $exists: false },
      },
      {
        $set: {
          expiresAt: new Date(),
        },
      },
    );

    await RequestAccessCode.create({
      requestId: cleaningRequest._id,
      channel: body.channel,
      codeHash: hashCode(code),
      expiresAt,
      attempts: 0,
    });

    /*
     * Replace this with your actual email/SMS provider.
     *
     * Never return the actual code in production.
     */
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[REQUEST ACCESS] ${reference} ${body.channel} code: ${code}`,
      );
    }

    return Response.json({
      sentTo: body.channel === "email" ? maskEmail(email) : maskPhone(phone),
    });
  } catch (error) {
    console.error(
      "POST /api/cleaning-requests/[reference]/access/send-code failed:",
      error,
    );

    return Response.json(
      { error: "Unable to send verification code." },
      { status: 500 },
    );
  }
}
