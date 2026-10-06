import type {
  Booking,
  BookingStatus,
  CleaningRequest,
  Inspection,
  Quote,
} from "@/lib/types";
import type { TimelineItem } from "@/components/kit/Timeline";
import { fmtDate } from "@/lib/utils";

export const BOOKING_STEPS = [
  "Confirmed",
  "Staff assigned",
  "En route",
  "Arrived",
  "Cleaning in progress",
  "Completed",
] as const;

export function bookingStepIndex(status: BookingStatus) {
  return {
    confirmed: 0,
    assigned: 1,
    en_route: 2,
    arrived: 3,
    in_progress: 4,
    completed: 5,
    cancelled: -1,
  }[status];
}

export function requestTimeline(
  r: CleaningRequest,
  o: {
    quote?: Quote;
    inspection?: Inspection;
    booking?: Booking;
  },
): TimelineItem[] {
  const { quote, inspection, booking } = o;

  const progressByStatus: Record<string, number> = {
    new: 1,
    under_review: 1,
    inspection_required: 2,
    quote_sent: 3,
    declined: 4,
    accepted: booking ? 7 : 5,
    completed: 8,
    rejected: 1,
    cancelled: 1,
  };

  const p = progressByStatus[r.status] ?? 1;

  const hadInspection = !!r.inspectionId;

  const st = (i: number): TimelineItem["state"] =>
    i < p ? "done" : i === p ? "current" : "upcoming";

  const items: TimelineItem[] = [
    {
      title: "Request submitted",
      description: "We've received your request.",
      date: fmtDate(r.submittedAt),
      state: "done",
    },
    {
      title: "Under review",
      description:
        r.status === "new"
          ? "Waiting in our queue. We usually respond within one business day."
          : "Our team is reviewing the details.",
      state: r.status === "new" ? "current" : st(1),
    },
    {
      title: "Inspection",
      description: inspection
        ? inspection.status === "completed"
          ? "Inspection completed."
          : `Scheduled for ${fmtDate(inspection.date)}.`
        : "Only needed for larger or complex spaces.",
      date: inspection ? fmtDate(inspection.date) : undefined,
      state: !hadInspection && p > 2 ? "skipped" : st(2),
    },
    {
      title: "Quote sent",
      description: "Your itemised quotation is ready to review.",
      date: quote ? fmtDate(quote.createdAt) : undefined,
      state: st(3),
    },
    {
      title: "Quote accepted",
      state: st(4),
    },
    {
      title: "Payment",
      description:
        p === 5 ? "Complete payment to confirm your booking." : undefined,
      state: st(5),
    },
    {
      title: "Booking confirmed",
      description: booking
        ? `${fmtDate(booking.date)} at ${booking.time}`
        : undefined,
      state: p === 7 ? "done" : st(6),
    },
    {
      title: "Completed",
      state: p >= 8 ? "done" : p === 7 ? "current" : "upcoming",
    },
  ];

  if (r.status === "rejected") {
    return [
      items[0],
      {
        title: "Request not accepted",
        description: r.adminNote ?? "We're unable to take on this request.",
        state: "current",
      },
    ];
  }

  if (r.status === "cancelled") {
    return [
      items[0],
      {
        title: "Request cancelled",
        state: "current",
      },
    ];
  }

  if (r.status === "declined") {
    return [
      ...items.slice(0, 4),
      {
        title: "Quote declined",
        description: "You declined this quote.",
        state: "current",
      },
    ];
  }

  return items;
}

/**
 * Customer-facing tracking timeline.
 *
 * This intentionally uses only information currently exposed
 * by the public REST status endpoint.
 */
export type PublicRequestStatus = {
  reference: string;
  status: string;
  submittedAt: string;

  propertyType?: string;
  services: string[];

  inspection?: {
    status: "scheduled" | "completed" | "cancelled";
    scheduledAt: string;
    completedAt?: string;
  };

  hasQuote: boolean;
  quoteStatus?: "draft" | "sent" | "accepted" | "declined" | "expired";
  quoteSentAt?: string;
  quoteExpiresAt?: string;

  paymentStatus?: "initialized" | "success" | "failed" | "abandoned";
  paidAt?: string;

  hasBooking: boolean;
  bookingStatus?: BookingStatus;
  bookingScheduledFor?: string;

  maskedEmail: string;
  maskedPhone: string;
};

export function trackingTimeline(request: PublicRequestStatus): TimelineItem[] {
  const {
    status,
    submittedAt,
    inspection,
    quoteStatus,
    paymentStatus,
    hasBooking,
    bookingStatus,
    bookingScheduledFor,
  } = request;

  if (status === "cancelled") {
    return [
      {
        title: "Submitted",
        description: "We've received your request.",
        date: fmtDate(submittedAt),
        state: "done",
      },
      {
        title: "Request cancelled",
        description: "This cleaning request has been cancelled.",
        state: "current",
      },
    ];
  }

  if (status === "declined" || quoteStatus === "declined") {
    return [
      {
        title: "Submitted",
        description: "We've received your request.",
        date: fmtDate(submittedAt),
        state: "done",
      },
      {
        title: "Quote declined",
        description: "This quote was declined.",
        state: "current",
      },
    ];
  }

  /*
   * Once a booking exists, the booking lifecycle becomes
   * the main source of customer-facing progress.
   */
  if (hasBooking && bookingStatus) {
    const bookingIndex = bookingStepIndex(bookingStatus);

    const items: TimelineItem[] = [
      {
        title: "Submitted",
        description: "We've received your request.",
        date: fmtDate(submittedAt),
        state: "done",
      },
      {
        title: "Under review",
        description: "Our team reviewed your cleaning requirements.",
        state: "done",
      },
      {
        title: "Quote ready",
        description: "Your quotation is ready.",
        state: "done",
      },
      {
        title: "Quote accepted",
        description: "Your quote has been accepted.",
        state: "done",
      },
      {
        title: "Payment",
        description:
          paymentStatus === "success"
            ? "Payment received."
            : "Payment is required to confirm your booking.",
        state: paymentStatus === "success" ? "done" : "current",
      },
      {
        title: "Booking confirmed",
        description: bookingScheduledFor
          ? `Scheduled for ${fmtDate(bookingScheduledFor)}.`
          : "Your cleaning has been booked.",
        state: bookingIndex >= 0 ? "done" : "current",
      },
    ];

    const bookingItems: TimelineItem[] = [
      {
        title: "Staff assigned",
        state:
          bookingIndex >= 1
            ? "done"
            : bookingIndex === 0
              ? "current"
              : "upcoming",
      },
      {
        title: "En route",
        state:
          bookingIndex >= 2
            ? "done"
            : bookingIndex === 1
              ? "current"
              : "upcoming",
      },
      {
        title: "Arrived",
        state:
          bookingIndex >= 3
            ? "done"
            : bookingIndex === 2
              ? "current"
              : "upcoming",
      },
      {
        title: "Cleaning in progress",
        state:
          bookingIndex >= 4
            ? "done"
            : bookingIndex === 3
              ? "current"
              : "upcoming",
      },
      {
        title: "Completed",
        description:
          bookingStatus === "completed"
            ? "Your cleaning has been completed."
            : undefined,
        state:
          bookingStatus === "completed"
            ? "done"
            : bookingIndex === 4
              ? "current"
              : "upcoming",
      },
    ];

    if (bookingStatus === "cancelled") {
      return [
        ...items,
        {
          title: "Booking cancelled",
          description: "This booking has been cancelled.",
          state: "current",
        },
      ];
    }

    return [...items, ...bookingItems];
  }

  /*
   * No booking yet: follow the request → inspection → quote → payment flow.
   */
  const inspectionRequired = status === "inspection_required";
  const inspectionScheduled = status === "inspection_scheduled";
  const inspectionCompleted = inspection?.status === "completed";

  return [
    {
      title: "Submitted",
      description: "We've received your request.",
      date: fmtDate(submittedAt),
      state: "done",
    },
    {
      title: "Under review",
      description:
        status === "reviewing"
          ? "Our team is reviewing your cleaning requirements."
          : undefined,
      state:
        status === "reviewing"
          ? "current"
          : status === "submitted"
            ? "upcoming"
            : "done",
    },
    {
      title: "Inspection",
      description: inspectionScheduled
        ? inspection?.scheduledAt
          ? `Scheduled for ${fmtDate(inspection.scheduledAt)}.`
          : "Your inspection has been scheduled."
        : inspectionCompleted
          ? "Inspection completed."
          : inspectionRequired
            ? "We'll arrange an inspection of the property."
            : "Only needed for larger or more complex spaces.",
      date: inspection?.scheduledAt
        ? fmtDate(inspection.scheduledAt)
        : undefined,
      state: inspectionCompleted
        ? "done"
        : inspectionScheduled || inspectionRequired
          ? "current"
          : status === "submitted" || status === "reviewing"
            ? "upcoming"
            : "skipped",
    },
    {
      title: "Quote ready",
      description:
        quoteStatus === "sent"
          ? "Your quotation is ready to review."
          : quoteStatus === "accepted"
            ? "Your quotation was accepted."
            : "We're preparing your quotation.",
      date: request.quoteSentAt ? fmtDate(request.quoteSentAt) : undefined,
      state:
        quoteStatus === "accepted"
          ? "done"
          : quoteStatus === "sent"
            ? "current"
            : "upcoming",
    },
    {
      title: "Quote accepted",
      description:
        quoteStatus === "accepted"
          ? "Your quote has been accepted."
          : undefined,
      state: quoteStatus === "accepted" ? "done" : "upcoming",
    },
    {
      title: "Payment",
      description:
        paymentStatus === "success"
          ? "Payment received."
          : quoteStatus === "accepted"
            ? "Complete payment to confirm your booking."
            : undefined,
      state:
        paymentStatus === "success"
          ? "done"
          : quoteStatus === "accepted"
            ? "current"
            : "upcoming",
    },
    {
      title: "Booking confirmed",
      description:
        paymentStatus === "success"
          ? "Your cleaning will be scheduled once booking confirmation is complete."
          : undefined,
      state: "upcoming",
    },
  ];
}
