import { cookies } from "next/headers";

import { CleaningRequest, Customer } from "@/server/models";
import { connectToDatabase } from "@/server/db/connect";

import {
  REQUEST_ACCESS_COOKIE_NAME,
  verifyRequestAccessToken,
} from "@/server/auth/request-access";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { reference } = await context.params;

    await connectToDatabase();

    const cleaningRequest = await CleaningRequest.findOne({
      reference: reference.trim(),
    }).lean();

    if (!cleaningRequest) {
      return Response.json(
        { error: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const cookieStore = await cookies();

    const token = cookieStore.get(REQUEST_ACCESS_COOKIE_NAME)?.value;

    if (!token) {
      return Response.json(
        { error: "Verification required." },
        { status: 401 },
      );
    }

    const payload = verifyRequestAccessToken(token);

    if (!payload) {
      return Response.json(
        { error: "Verification required." },
        { status: 401 },
      );
    }

    if (
      payload.requestId !== cleaningRequest._id.toString() ||
      payload.customerId !== cleaningRequest.customerId.toString()
    ) {
      return Response.json(
        { error: "You are not authorized to view this request." },
        { status: 403 },
      );
    }

    const customer = await Customer.findById(cleaningRequest.customerId)
      .select("hasAccount")
      .lean();

    return Response.json({
      request: {
        id: cleaningRequest._id.toString(),
        reference: cleaningRequest.reference,
        hasAccount: customer?.hasAccount ?? false,

        contact: {
          name: cleaningRequest.contactSnapshot?.name ?? "",
          email: cleaningRequest.contactSnapshot?.email ?? "",
          phone: cleaningRequest.contactSnapshot?.phone ?? "",
        },

        requestedServices: cleaningRequest.requestedServices ?? [],

        propertyType: cleaningRequest.propertyType ?? undefined,

        address: cleaningRequest.address,

        propertyDetails: cleaningRequest.propertyDetails ?? {},

        bedrooms: cleaningRequest.bedrooms ?? undefined,

        bathrooms: cleaningRequest.bathrooms ?? undefined,

        preferredDate: cleaningRequest.preferredDate,

        preferredTimeSlot: cleaningRequest.preferredTimeSlot ?? "",

        schedule: cleaningRequest.schedule ?? {
          flexible: false,
        },

        notes: cleaningRequest.notes ?? undefined,

        photos: cleaningRequest.photos ?? [],

        status: cleaningRequest.status,

        submittedAt: cleaningRequest.createdAt,

        // Add quoteId / bookingId here later
        // when those relationships are added
        // to CleaningRequest.
      },
    });
  } catch (error) {
    console.error("GET /api/cleaning-requests/[reference] failed:", error);

    return Response.json(
      { error: "Unable to load cleaning request." },
      { status: 500 },
    );
  }
}
