import { requireAdmin } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/server/db/connect";
import { CleaningRequest } from "@/server/models";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatuses = ["reviewing", "declined", "cancelled"] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

type UpdateStatusBody = {
  status?: AllowedStatus;
  note?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }
    await connectToDatabase();

    const { id } = await context.params;

    let body: UpdateStatusBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const status = body.status;

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          message: "Invalid request status.",
        },
        { status: 400 },
      );
    }

    const cleaningRequest = await CleaningRequest.findById(id);

    if (!cleaningRequest) {
      return NextResponse.json(
        {
          message: "Cleaning request not found.",
        },
        { status: 404 },
      );
    }

    if (status === "reviewing" && cleaningRequest.status !== "submitted") {
      return NextResponse.json(
        {
          message: "Only submitted requests can be moved to review.",
        },
        { status: 409 },
      );
    }

    if (
      status === "declined" &&
      ["accepted", "converted", "cancelled"].includes(cleaningRequest.status)
    ) {
      return NextResponse.json(
        {
          message: "This request can no longer be declined.",
        },
        { status: 409 },
      );
    }

    if (
      status === "cancelled" &&
      ["converted", "cancelled"].includes(cleaningRequest.status)
    ) {
      return NextResponse.json(
        {
          message: "This request can no longer be cancelled.",
        },
        { status: 409 },
      );
    }

    cleaningRequest.status = status;

    if (status === "declined") {
      // Only add this if your CleaningRequest schema
      // contains an adminNote field.
      //
      // cleaningRequest.adminNote = body.note?.trim();
    }

    await cleaningRequest.save();

    return NextResponse.json({
      request: {
        id: cleaningRequest._id.toString(),
        reference: cleaningRequest.reference,
        customerId: cleaningRequest.customerId.toString(),
        status: cleaningRequest.status,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/cleaning-requests/[id]/status failed:",
      error,
    );

    return NextResponse.json(
      {
        message: "Unable to update cleaning request status.",
      },
      { status: 500 },
    );
  }
}
