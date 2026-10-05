import { canAccessCustomerRequest } from "@/server/auth/customer-request-access";
import { connectToDatabase } from "@/server/db/connect";
import { Booking, CleaningRequest, Customer, Inspection, Quote } from "@/server/models";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reference: string }>;
};

function customerStatus(status: string) {
  switch (status) {
    case "submitted": return "new";
    case "reviewing": return "under_review";
    case "inspection_scheduled": return "inspection_required";
    case "quoted": return "quote_sent";
    case "converted": return "accepted";
    default: return status;
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();
    const { reference } = await context.params;
    const cleaningRequest = await CleaningRequest.findOne({ reference: reference.trim() }).lean();

    if (!cleaningRequest) return NextResponse.json({ message: "Request not found." }, { status: 404 });
    if (!(await canAccessCustomerRequest(request, cleaningRequest._id.toString(), cleaningRequest.customerId.toString()))) {
      return NextResponse.json({ message: "Request verification or customer login is required." }, { status: 401 });
    }

    const [customer, quote, booking, inspection] = await Promise.all([
      Customer.findById(cleaningRequest.customerId).select("firstName lastName email phone hasAccount").lean(),
      Quote.findOne({ requestId: cleaningRequest._id }).sort({ createdAt: -1 }).lean(),
      Booking.findOne({ requestId: cleaningRequest._id }).lean(),
      cleaningRequest.inspectionId ? Inspection.findById(cleaningRequest.inspectionId).lean() : null,
    ]);

    const scheduledAt = inspection?.scheduledAt;
    const address = cleaningRequest.address;
    const requestData = {
      id: cleaningRequest.reference,
      reference: cleaningRequest.reference,
      customerId: cleaningRequest.customerId.toString(),
      status: customerStatus(cleaningRequest.status),
      services: cleaningRequest.requestedServices.map(
        (service: { name: string }) => service.name,
      ),
      requestedServices: cleaningRequest.requestedServices.map((service: { serviceId: { toString(): string }; name: string }) => ({
        serviceId: service.serviceId.toString(),
        name: service.name,
      })),
      address: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        area: address.area ?? "",
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
        landmark: address.landmark,
        directions: address.directions,
      },
      propertyType: cleaningRequest.propertyType,
      bedrooms: cleaningRequest.bedrooms,
      bathrooms: cleaningRequest.bathrooms,
      propertyDetails: cleaningRequest.propertyDetails ?? {},
      schedule: {
        alternativeDate: cleaningRequest.schedule?.alternativeDate?.toISOString(),
        alternativeTimeSlot: cleaningRequest.schedule?.alternativeTimeSlot,
        flexible: cleaningRequest.schedule?.flexible ?? false,
      },
      preferredDate: cleaningRequest.preferredDate?.toISOString(),
      preferredTimeSlot: cleaningRequest.preferredTimeSlot ?? "",
      notes: cleaningRequest.notes ?? "",
      photos: cleaningRequest.photos ?? [],
      createdAt: cleaningRequest.createdAt.toISOString(),
      updatedAt: cleaningRequest.updatedAt.toISOString(),
      inspectionId: inspection?._id.toString(),
      quoteId: quote?._id.toString(),
      bookingId: booking?._id.toString(),
    };

    return NextResponse.json({
      request: requestData,
      customer: customer ? {
        id: customer._id.toString(),
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        hasAccount: customer.hasAccount,
      } : null,
      inspection: inspection ? {
        id: inspection._id.toString(),
        scheduledAt: scheduledAt?.toISOString(),
        status: inspection.status,
        notes: inspection.notes,
        findings: inspection.findings,
        completedAt: inspection.completedAt?.toISOString(),
      } : null,
      quote: quote ? {
        id: quote._id.toString(),
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        totalKobo: quote.totalKobo,
        createdAt: quote.createdAt.toISOString(),
        expiresAt: quote.expiresAt?.toISOString(),
        acceptedAt: quote.acceptedAt?.toISOString(),
      } : null,
      booking: booking ? {
        id: booking._id.toString(),
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        scheduledFor: booking.scheduledFor?.toISOString(),
      } : null,
    });
  } catch (error) {
    console.error("GET customer request detail failed:", error);
    return NextResponse.json({ message: "Unable to load this request." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();
    const { reference } = await context.params;
    const cleaningRequest = await CleaningRequest.findOne({ reference: reference.trim() });

    if (!cleaningRequest) return NextResponse.json({ message: "Request not found." }, { status: 404 });
    if (!(await canAccessCustomerRequest(request, cleaningRequest._id.toString(), cleaningRequest.customerId.toString()))) {
      return NextResponse.json({ message: "Request verification or customer login is required." }, { status: 401 });
    }

    if (!["submitted", "reviewing", "inspection_required"].includes(cleaningRequest.status)) {
      return NextResponse.json({ message: "This request can no longer be cancelled." }, { status: 409 });
    }

    cleaningRequest.status = "cancelled";
    await cleaningRequest.save();
    return NextResponse.json({ cancelled: true });
  } catch (error) {
    console.error("PATCH customer request cancellation failed:", error);
    return NextResponse.json({ message: "Unable to cancel this request." }, { status: 500 });
  }
}