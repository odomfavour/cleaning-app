import { Booking, CleaningRequest, Customer, StaffProfile } from "@/server/models";
import { Types } from "mongoose";

export async function getStaffBooking(bookingId: string, staffProfileId: string) {
  if (!Types.ObjectId.isValid(bookingId)) return null;

  const booking = await Booking.findOne({
    _id: bookingId,
    assignedStaffIds: staffProfileId,
  }).lean();

  if (!booking) return null;

  const [request, customer, team] = await Promise.all([
    CleaningRequest.findById(booking.requestId).lean(),
    Customer.findById(booking.customerId).select("firstName lastName email phone").lean(),
    StaffProfile.find({ _id: { $in: booking.assignedStaffIds } })
      .select("_id firstName lastName role phone")
      .lean(),
  ]);

  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    amountKobo: booking.amountKobo,
    date: booking.scheduledFor?.toISOString() ?? request?.preferredDate?.toISOString() ?? null,
    time: request?.preferredTimeSlot ?? null,
    title: request?.requestedServices.map(
      (service: { name: string }) => service.name,
    ).join(", ") ?? "Cleaning booking",
    location: request
      ? [request.address.addressLine1, request.address.area, request.address.city]
          .filter(Boolean)
          .join(", ")
      : "",
    instructions: request?.notes ?? "",
    customer: customer
      ? {
          id: customer._id.toString(),
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          phone: customer.phone ?? "",
          email: customer.email ?? "",
        }
      : null,
    team: team.map((member: {
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
    })),
  };
}