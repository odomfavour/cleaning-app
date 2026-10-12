import { sendEmail } from "@/server/services/email.service";
import { verificationEmail } from "@/server/services/email-templates";
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

    if (body.channel === "phone") {
      return Response.json({ error: "SMS verification is unavailable. Please use email." }, { status: 503 });
    }

    await connectToDatabase();

    const cleaningRequest = await CleaningRequest.findOne({
      reference: reference.trim(),
    }).select("_id customerId contactSnapshot");

    if (!cleaningRequest) {
      return Response.json(
        { error: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const email = cleaningRequest.contactSnapshot?.email;
    if (!email) {
      return Response.json({ error: "No email address is available for this request." }, { status: 400 });
    }

    const recentCode = await RequestAccessCode.exists({
      requestId: cleaningRequest._id,
      createdAt: { $gt: new Date(Date.now() - 60_000) },
    });
    if (recentCode) {
      return Response.json({ error: "Please wait a minute before requesting another code." }, { status: 429 });
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

    const accessCode = await RequestAccessCode.create({
      requestId: cleaningRequest._id,
      channel: body.channel,
      codeHash: hashCode(code),
      expiresAt,
      attempts: 0,
    });

    try {
      await sendEmail({
        type: "verification",
        to: email!,
        customerId: cleaningRequest.customerId,
        metadata: { requestReference: reference },
        ...verificationEmail(code),
      });
    } catch {
      await RequestAccessCode.deleteOne({ _id: accessCode._id });
      return Response.json({ error: "Unable to send verification code. Please try again." }, { status: 502 });
    }

    return Response.json({
      sentTo: maskEmail(email),
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
