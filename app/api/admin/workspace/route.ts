import { requireAdmin } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/server/db/connect";
import {
  Booking,
  CleaningRequest,
  CleaningService,
  Customer,
  Inspection,
  Payment,
  Quote,
  Review,
  StaffProfile,
} from "@/server/models";
import { NextResponse } from "next/server";

const mapRequestStatus = (status: string) => {
  switch (status) {
    case "submitted": return "new";
    case "reviewing": return "under_review";
    case "inspection_scheduled": return "inspection_required";
    case "quoted": return "quote_sent";
    case "converted": return "accepted";
    default: return status;
  }
};

const mapPaymentStatus = (status: string) => {
  switch (status) {
    case "success": return "paid";
    case "initialized": return "pending";
    case "abandoned": return "failed";
    default: return status;
  }
};

export async function GET() {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    await connectToDatabase();

    const [customerDocs, staffDocs, serviceDocs, requestDocs, inspectionDocs, quoteDocs, bookingDocs, paymentDocs, reviewDocs] = await Promise.all([
      Customer.find({}).sort({ createdAt: -1 }).lean(),
      StaffProfile.find({}).sort({ firstName: 1 }).lean(),
      CleaningService.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
      CleaningRequest.find({}).sort({ createdAt: -1 }).lean(),
      Inspection.find({}).sort({ scheduledAt: -1 }).lean(),
      Quote.find({}).sort({ createdAt: -1 }).lean(),
      Booking.find({}).sort({ scheduledFor: 1, createdAt: -1 }).lean(),
      Payment.find({}).sort({ createdAt: -1 }).lean(),
      Review.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    const customerMap = new Map(customerDocs.map((customer) => [customer._id.toString(), customer]));
    const requestMap = new Map(requestDocs.map((request) => [request._id.toString(), request]));
    const latestQuoteByRequest = new Map<string, (typeof quoteDocs)[number]>();
    for (const quote of quoteDocs) {
      const requestId = quote.requestId.toString();
      if (!latestQuoteByRequest.has(requestId)) latestQuoteByRequest.set(requestId, quote);
    }
    const bookingByRequest = new Map(bookingsByRequest(bookingDocs));
    const inspectionByRequest = new Map(
      inspectionDocs.map((inspection) => [inspection.requestId.toString(), inspection]),
    );
    const reviewByBooking = new Map(
      reviewDocs.map((review) => [review.bookingId.toString(), review]),
    );

    const requests = requestDocs.map((request) => {
      const quote = latestQuoteByRequest.get(request._id.toString());
      const booking = bookingByRequest.get(request._id.toString());
      const inspection = inspectionByRequest.get(request._id.toString());
      const environment = request.propertyDetails?.environment ?? request.propertyType ?? "other";
      const contact = {
        name: request.contactSnapshot?.name ?? "",
        email: request.contactSnapshot?.email ?? "",
        phone: request.contactSnapshot?.phone ?? "",
      };
      const property = {
        bedrooms: request.bedrooms,
        bathrooms: request.bathrooms,
        livingRooms: request.propertyDetails?.livingRooms,
        floors: request.propertyDetails?.floors,
        kitchens: request.propertyDetails?.kitchens,
        rooms: request.propertyDetails?.rooms,
        size: request.propertyDetails?.size,
        additional: request.propertyDetails?.additional,
      };

      return {
        id: request.reference,
        reference: request.reference,
        customerId: request.customerId.toString(),
        contact,
        environment,
        requestedServices: request.requestedServices.map((service: { serviceId: { toString(): string }; name: string }) => ({
          serviceId: service.serviceId.toString(),
          name: service.name,
        })),
        services: request.requestedServices.map((service: { name: string }) => service.name),
        property,
        description: request.notes ?? "",
        specialRequirements: "",
        attentionAreas: "",
        photos: request.photos ?? [],
        location: {
          address: request.address.addressLine1,
          city: request.address.city,
          area: request.address.area ?? "",
          landmark: request.address.landmark ?? "",
          directions: request.address.directions ?? "",
        },
        preferred: {
          date: request.preferredDate?.toISOString() ?? "",
          time: request.preferredTimeSlot ?? "",
          altDate: request.schedule?.alternativeDate?.toISOString(),
          altTime: request.schedule?.alternativeTimeSlot,
          flexible: request.schedule?.flexible ?? false,
        },
        status: mapRequestStatus(request.status),
        submittedAt: request.createdAt.toISOString(),
        inspectionId: inspection?._id.toString(),
        quoteId: quote?._id.toString(),
        bookingId: booking?._id.toString(),
        adminNote: "",
      };
    });

    const requestForQuote = (quote: (typeof quoteDocs)[number]) => {
      const request = requestMap.get(quote.requestId.toString());
      if (!request) return null;
      return requests.find((candidate) => candidate.reference === request.reference) ?? null;
    };

    const quotes = quoteDocs.map((quote) => {
      const customer = customerMap.get(quote.customerId.toString());
      return {
        id: quote._id.toString(),
        quoteNumber: quote.quoteNumber,
        requestId: quote.requestId.toString(),
        customerId: quote.customerId.toString(),
        request: requestForQuote(quote),
        customer: customer ? {
          id: customer._id.toString(),
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email ?? "",
          phone: customer.phone ?? "",
        } : null,
        items: quote.items.map((item: { _id: { toString(): string }; description: string; quantity: number; unitPriceKobo: number; totalKobo: number }) => ({
          id: item._id.toString(),
          description: item.description,
          amount: item.totalKobo / 100,
          quantity: item.quantity,
          unitPriceKobo: item.unitPriceKobo,
          totalKobo: item.totalKobo,
        })),
        subtotalKobo: quote.subtotalKobo,
        discountKobo: quote.discountKobo,
        discount: quote.discountKobo / 100,
        taxRate: quote.taxRate,
        taxKobo: quote.taxKobo,
        totalKobo: quote.totalKobo,
        terms: quote.terms,
        status: quote.status,
        sentAt: quote.sentAt?.toISOString(),
        expiresAt: quote.expiresAt?.toISOString(),
        validUntil: quote.expiresAt?.toISOString() ?? "",
        acceptedAt: quote.acceptedAt?.toISOString(),
        declinedAt: quote.declinedAt?.toISOString(),
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
      };
    });

    const bookings = bookingDocs.map((booking) => {
      const request = requestMap.get(booking.requestId.toString());
      const review = reviewByBooking.get(booking._id.toString());
      return {
        id: booking._id.toString(),
        requestId: request?.reference ?? booking.requestId.toString(),
        quoteId: booking.quoteId.toString(),
        customerId: booking.customerId.toString(),
        title: request?.requestedServices.map((service: { name: string }) => service.name).join(", ") ?? "Cleaning booking",
        location: request ? [request.address.addressLine1, request.address.area, request.address.city].filter(Boolean).join(", ") : "",
        date: booking.scheduledFor?.toISOString() ?? request?.preferredDate?.toISOString() ?? "",
        time: request?.preferredTimeSlot ?? "",
        completedAt: booking.completedAt?.toISOString(),
        durationHrs: 4,
        staffIds: booking.assignedStaffIds.map((id: { toString(): string }) => id.toString()),
        status: booking.status === "assigned" ? "staff_assigned" : booking.status,
        amount: booking.amountKobo / 100,
        paymentId: booking.paymentReference,
        instructions: request?.notes ?? "",
        beforePhotos: [],
        afterPhotos: [],
        reviewId: review?._id.toString(),
      };
    });

    const payments = paymentDocs.map((payment) => ({
      id: payment._id.toString(),
      reference: payment.reference,
      customerId: payment.customerId.toString(),
      quoteId: payment.quoteId.toString(),
      bookingId: payment.bookingId?.toString(),
      amount: payment.amountKobo / 100,
      method: "card",
      date: payment.paidAt?.toISOString() ?? payment.createdAt.toISOString(),
      status: mapPaymentStatus(payment.status),
    }));

    const reviews = reviewDocs.map((review) => {
      const booking = bookingDocs.find((item) => item._id.toString() === review.bookingId.toString());
      const request = booking ? requestMap.get(booking.requestId.toString()) : null;
      return {
        id: review._id.toString(),
        bookingId: review.bookingId.toString(),
        customerId: review.customerId.toString(),
        service: request?.requestedServices.map((service: { name: string }) => service.name).join(", ") ?? "Cleaning service",
        rating: review.rating,
        comment: review.comment ?? "",
        date: review.createdAt.toISOString(),
        photos: review.photos ?? [],
      };
    });

    const inspections = inspectionDocs.map((inspection) => {
      const date = new Date(inspection.scheduledAt);
      const request = requestMap.get(inspection.requestId.toString());
      return {
        id: inspection._id.toString(),
        requestId: request?.reference ?? inspection.requestId.toString(),
        inspectorId: inspection.conductedBy?.toString() ?? "",
        date: new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(date),
        time: new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false }).format(date),
        status: inspection.status,
        report: inspection.report,
      };
    });

    const customers = customerDocs.map((customer) => ({
      id: customer._id.toString(),
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      role: "customer",
      status: customer.status === "blocked" ? "inactive" : "active",
      joinedAt: customer.createdAt.toISOString(),
      addresses: [],
      hasAccount: customer.hasAccount,
    }));

    const staff = staffDocs.map((member) => ({
      id: member._id.toString(),
      name: `${member.firstName} ${member.lastName}`.trim(),
      phone: member.phone,
      email: member.email,
      role: member.role,
      availability: member.availability,
      status: member.active ? "active" : "inactive",
      activeJobs: bookingDocs.filter((booking) => booking.assignedStaffIds.some((id: { toString(): string }) => id.toString() === member._id.toString()) && !["completed", "cancelled"].includes(booking.status)).length,
      completedJobs: bookingDocs.filter((booking) => booking.assignedStaffIds.some((id: { toString(): string }) => id.toString() === member._id.toString()) && booking.status === "completed").length,
      rating: member.rating ?? 0,
    }));

    const services = serviceDocs.map((service) => ({
      id: service._id.toString(),
      name: service.name,
      description: service.description ?? "",
      guidance: service.guidance ?? "",
      duration: service.duration ?? "",
      active: service.active,
    }));

    return NextResponse.json({
      customers,
      staff,
      services,
      requests,
      inspections,
      quotes,
      bookings,
      payments,
      reviews,
    });
  } catch (error) {
    console.error("GET /api/admin/workspace failed:", error);
    return NextResponse.json({ message: "Unable to load admin workspace." }, { status: 500 });
  }
}

function bookingsByRequest(bookings: Array<{ requestId: { toString(): string }; _id: { toString(): string } }>) {
  return bookings.map((booking) => [booking.requestId.toString(), booking] as const);
}