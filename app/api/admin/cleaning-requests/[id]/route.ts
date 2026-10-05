import { requireAdmin } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/server/db/connect";
import {
  Booking,
  CleaningRequest,
  Customer,
  Inspection,
  Quote,
} from "@/server/models";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { response } = await requireAdmin();

    if (response) {
      return response;
    }

    await connectToDatabase();

    const { id } = await context.params;

    const request = await CleaningRequest.findById(id).lean();

    if (!request) {
      return NextResponse.json(
        { message: "Cleaning request not found." },
        { status: 404 },
      );
    }

    const [customer, inspection, quote, booking] = await Promise.all([
      Customer.findById(request.customerId)
        .select("_id firstName lastName email phone hasAccount")
        .lean(),

      Inspection.findOne({
        requestId: request._id,
      })
        .sort({ createdAt: -1 })
        .lean(),

      Quote.findOne({
        requestId: request._id,
      })
        .sort({ createdAt: -1 })
        .lean(),

      Booking.findOne({
        requestId: request._id,
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const responseData = {
      request: {
        id: request._id.toString(),
        reference: request.reference,
        customerId: request.customerId.toString(),

        status: request.status,

        requestedServices: request.requestedServices.map((service) => ({
          serviceId: service.serviceId.toString(),
          name: service.name,
        })),

        address: request.address,

        propertyType: request.propertyType,

        bedrooms: request.bedrooms,
        bathrooms: request.bathrooms,

        propertyDetails: {
          environment: request.propertyDetails?.environment,
          livingRooms: request.propertyDetails?.livingRooms,
          floors: request.propertyDetails?.floors,
          kitchens: request.propertyDetails?.kitchens,
          rooms: request.propertyDetails?.rooms,
          size: request.propertyDetails?.size,
          additional: request.propertyDetails?.additional,
        },

        preferredDate: request.preferredDate?.toISOString(),

        preferredTimeSlot: request.preferredTimeSlot,

        schedule: {
          alternativeDate: request.schedule?.alternativeDate?.toISOString(),

          alternativeTimeSlot: request.schedule?.alternativeTimeSlot,

          flexible: request.schedule?.flexible ?? false,
        },

        notes: request.notes,
        photos: request.photos ?? [],

        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
      },

      customer: customer
        ? {
            id: customer._id.toString(),
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            email: customer.email,
            phone: customer.phone,
            hasAccount: customer.hasAccount,
          }
        : {
            id: request.customerId.toString(),
            name: request.contactSnapshot?.name ?? "Unknown customer",
            email: request.contactSnapshot?.email,
            phone: request.contactSnapshot?.phone,
            hasAccount: false,
          },

      inspection: inspection
        ? {
            id: inspection._id.toString(),
            scheduledAt: inspection.scheduledAt.toISOString(),
            status: inspection.status,
            notes: inspection.notes,
            findings: inspection.findings,
            completedAt: inspection.completedAt?.toISOString(),
          }
        : null,

      quote: quote
        ? {
            id: quote._id.toString(),
            quoteNumber: quote.quoteNumber,
            status: quote.status,
            totalKobo: quote.totalKobo,
            sentAt: quote.sentAt?.toISOString(),
            expiresAt: quote.expiresAt?.toISOString(),
            acceptedAt: quote.acceptedAt?.toISOString(),
            declinedAt: quote.declinedAt?.toISOString(),
          }
        : null,

      booking: booking
        ? {
            id: booking._id.toString(),
            bookingNumber: booking.bookingNumber,
            status: booking.status,
            scheduledFor: booking.scheduledFor?.toISOString(),
          }
        : null,
    };

    return NextResponse.json({
      data: responseData,
    });
  } catch (error) {
    console.error("GET /api/admin/cleaning-requests/[id] failed:", error);

    return NextResponse.json(
      {
        message: "Unable to load cleaning request.",
      },
      { status: 500 },
    );
  }
}
