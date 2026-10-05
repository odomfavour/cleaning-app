"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  CalendarClock,
  Clock,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from "lucide-react";

import { Avatar, Stars } from "@/components/kit/Misc";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";
import { Dialog } from "@/components/kit/Dialog";
import { ErrorState, PageHeader, PageSkeleton } from "@/components/kit/Page";
import { StatusBadge } from "@/components/kit/Badge";
import { ProgressTracker } from "@/components/kit/Timeline";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getCustomerBooking } from "@/lib/api/services/customer-booking.service";
import { bookingStatus } from "@/lib/status";
import { BOOKING_STEPS, bookingStepIndex } from "@/lib/timeline";
import { org } from "@/lib/config";
import { fmtDate, fmtTime, naira } from "@/lib/utils";

const bookingKey = (id: string) => ["customer-booking", id] as const;

function displayStatus(status: string) {
  return status === "assigned" ? "staff_assigned" : status;
}

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [helpOpen, setHelpOpen] = useState(false);
  const query = useQuery({
    queryKey: bookingKey(id),
    queryFn: () => getCustomerBooking(id),
    enabled: !!id,
  });

  if (query.isLoading) return <PageSkeleton />;
  if (query.error || !query.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const booking = query.data;
  const live = ["en_route", "arrived", "in_progress"].includes(booking.status);
  const canceled = booking.status === "cancelled";

  return (
    <>
      <PageHeader
        back={{ href: "/dashboard/bookings", label: "My bookings" }}
        title={booking.title}
        meta={
          <StatusBadge
            status={displayStatus(booking.status)}
            map={bookingStatus}
          />
        }
        description={`Booking ${booking.bookingNumber}`}
        actions={
          <>
            {booking.status === "completed" && !booking.review && (
              <Button href={`/dashboard/bookings/${booking.id}/review`}>
                <Star className="size-4" />
                Leave a review
              </Button>
            )}
            <Button variant="secondary" onClick={() => setHelpOpen(true)}>
              <LifeBuoy className="size-4" />
              Contact support
            </Button>
          </>
        }
      />

      {canceled ? (
        <Card className="mb-6 bg-muted/40">
          <CardBody>
            <p className="text-sm text-foreground/80">
              This booking was cancelled. If you paid, any refund will be
              returned to your original payment method.
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader
            title={
              live
                ? "Your cleaning is underway"
                : booking.status === "completed"
                  ? "Cleaning completed"
                  : "Progress"
            }
            description={
              live
                ? "This page updates as the team moves through each stage."
                : undefined
            }
          />
          <CardBody>
            <ProgressTracker
              steps={[...BOOKING_STEPS]}
              current={bookingStepIndex(booking.status)}
            />
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Booking details" />
            <CardBody className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Info
                  icon={CalendarClock}
                  label="Date"
                  value={
                    booking.date ? fmtDate(booking.date) : "Schedule pending"
                  }
                />
                <Info
                  icon={Clock}
                  label="Time"
                  value={`${fmtTime(booking.time ?? undefined)} · final schedule confirmed by the team`}
                />
                <Info
                  icon={MapPin}
                  label="Location"
                  value={booking.location || "Location unavailable"}
                />
              </div>
              <DetailList
                items={[
                  { label: "Service", value: booking.title },
                  {
                    label: "Amount paid",
                    value: naira(booking.amountKobo / 100),
                  },
                  {
                    label: "Original request",
                    value: booking.requestReference || "—",
                  },
                  {
                    label: "Payment",
                    value: booking.payment
                      ? `${booking.payment.reference} (${booking.payment.status})`
                      : booking.paymentReference,
                  },
                  {
                    label: "Instructions for the team",
                    value: booking.instructions || "—",
                  },
                ]}
              />
            </CardBody>
          </Card>

          {booking.review && (
            <Card>
              <CardHeader title="Your review" />
              <CardBody>
                <Stars value={booking.review.rating} />
                {booking.review.comment && (
                  <p className="mt-2 text-[15px] text-foreground">
                    {booking.review.comment}
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader title="Your cleaning team" />
          {booking.team.length === 0 ? (
            <CardBody>
              <p className="text-sm text-muted-foreground">
                We&apos;re assigning your team. You&apos;ll get an update when
                it&apos;s confirmed.
              </p>
            </CardBody>
          ) : (
            <ul className="divide-y divide-border">
              {booking.team.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <Avatar name={member.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                  <a
                    href={`tel:${member.phone}`}
                    aria-label={`Call ${member.name}`}
                    className="flex size-9 items-center justify-center rounded-lg border border-border text-blue-700 hover:bg-blue-50"
                  >
                    <Phone className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Contact support"
        description={`Questions about ${booking.bookingNumber}? Our team is available ${org.hours}.`}
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setHelpOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-2.5">
          <Button
            href={`tel:${org.phone.replace(/\s/g, "")}`}
            variant="secondary"
            full
            className="justify-start"
          >
            <Phone className="size-4" />
            Call {org.phone}
          </Button>
          <Button
            href={`https://wa.me/${org.phone.replace(/\D/g, "")}`}
            variant="secondary"
            full
            className="justify-start"
          >
            <MessageCircle className="size-4" />
            Message on WhatsApp
          </Button>
          <Button
            href={`mailto:${org.email}?subject=${booking.bookingNumber}`}
            variant="secondary"
            full
            className="justify-start"
          >
            <Mail className="size-4" />
            Email {org.email}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-blue-700" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-[15px] font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
