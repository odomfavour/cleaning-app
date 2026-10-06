import {
  Booking,
  CleaningRequest,
  Payment,
  Review,
  StaffProfile,
} from "@/server/models";
import { Types } from "mongoose";

type BookingRecord = {
  _id: Types.ObjectId;
  bookingNumber: string;
  requestId: Types.ObjectId;
  customerId: Types.ObjectId;
  status: string;
  scheduledFor?: Date;
  amountKobo: number;
  paymentReference: string;
  confirmedAt: Date;
  assignedStaffIds: Types.ObjectId[];
};

export async function serializeCustomerBooking(booking: BookingRecord) {
  const [request, staff, payment, review] = await Promise.all([
    CleaningRequest.findById(booking.requestId).lean(),
    StaffProfile.find({ _id: { $in: booking.assignedStaffIds } })
      .select("_id firstName lastName role phone")
      .lean(),
    Payment.findOne({ reference: booking.paymentReference }).lean(),
    Review.findOne({ bookingId: booking._id }).lean(),
  ]);

  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    amountKobo: booking.amountKobo,
    paymentReference: booking.paymentReference,
    date:
      booking.scheduledFor?.toISOString() ??
      request?.preferredDate?.toISOString() ??
      null,
    time: request?.preferredTimeSlot ?? null,
    location: request
      ? [
          request.address.addressLine1,
          request.address.area,
          request.address.city,
          request.address.state,
        ]
          .filter(Boolean)
          .join(", ")
      : "",
    title:
      request?.requestedServices
        .map((service: { name: string }) => service.name)
        .join(", ") ?? "Cleaning booking",
    instructions: request?.notes ?? "",
    requestReference: request?.reference ?? "",
    team: staff.map(
      (member: {
        _id: Types.ObjectId;
        firstName: string;
        lastName: string;
        role: string;
        phone: string;
      }) => ({
        id: member._id.toString(),
        name: `${member.firstName} ${member.lastName}`.trim(),
        role: member.role,
        phone: member.phone,
      }),
    ),
    payment: payment
      ? {
          reference: payment.reference,
          status: payment.status,
          paidAt: payment.paidAt?.toISOString() ?? null,
        }
      : null,
    review: review
      ? {
          rating: review.rating,
          comment: review.comment ?? "",
          photos: review.photos ?? [],
        }
      : null,
  };
}

export async function findCustomerBooking(
  customerId: string,
  bookingId: string,
) {
  if (!Types.ObjectId.isValid(bookingId)) return null;

  const booking = await Booking.findOne({
    _id: bookingId,
    customerId,
  }).lean();

  return booking ? serializeCustomerBooking(booking as BookingRecord) : null;
}
