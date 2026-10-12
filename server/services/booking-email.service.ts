import { CleaningRequest } from "@/server/models/CleaningRequest";
import { Customer } from "@/server/models/Customer";
import { sendEmailSafely } from "./email.service";
import { bookingConfirmedEmail } from "./email-templates";

export async function sendBookingConfirmation(booking: {
  _id: { toString(): string };
  requestId: unknown;
  customerId: unknown;
  bookingNumber: string;
  amountKobo: number;
}) {
  try {
    const request = await CleaningRequest.findById(booking.requestId).lean();
    if (!request) return;
    const customer = await Customer.findById(booking.customerId).select("email").lean();
    const to = request.contactSnapshot?.email || customer?.email;
    if (!to) return;
    await sendEmailSafely({
      type: "booking_confirmed",
      to,
      customerId: booking.customerId,
      deliveryKey: `booking-confirmed/${booking._id}`,
      metadata: { requestReference: request.reference, bookingId: booking._id.toString() },
      ...bookingConfirmedEmail({ reference: request.reference, bookingNumber: booking.bookingNumber, amountKobo: booking.amountKobo }),
    });
  } catch {
    console.error("Unable to prepare booking confirmation email.");
  }
}
