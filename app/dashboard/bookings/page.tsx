"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck } from "lucide-react";
import {
  PageHeader,
  PageSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { Badge, StatusBadge } from "@/components/kit/Badge";
import { Avatar } from "@/components/kit/Misc";
import { bookingStatus } from "@/lib/status";
import { fmtDate, fmtTime } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getCustomerBookings } from "@/lib/api/services/customer-booking.service";

function displayStatus(status: string) {
  return status === "assigned" ? "staff_assigned" : status;
}

export default function MyBookingsPage() {
  const query = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: getCustomerBookings,
  });
  const bookings = query.data ?? [];
  const upcoming = bookings.filter(
    (booking) => !["completed", "cancelled"].includes(booking.status),
  );
  const past = bookings.filter((booking) =>
    ["completed", "cancelled"].includes(booking.status),
  );

  if (query.isLoading) return <PageSkeleton />;
  if (query.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const bookingCard = (booking: (typeof bookings)[number], compact = false) => (
    <Link
      key={booking.id}
      href={`/dashboard/bookings/${booking.id}`}
      className="block"
    >
      <Card className="p-5 transition-colors hover:border-blue-300">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {booking.bookingNumber}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-primary">
              {booking.title}
            </h3>
          </div>
          <StatusBadge
            status={displayStatus(booking.status)}
            map={bookingStatus}
          />
        </div>
        <p className="mt-3 text-sm text-foreground/80">
          {booking.date
            ? `${fmtDate(booking.date)}${booking.time ? ` at ${fmtTime(booking.time)}` : ""}`
            : "Schedule pending"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{booking.location}</p>
        {!compact && (
          <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
            {booking.team.length ? (
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex -space-x-2">
                  {booking.team.map((member) => (
                    <Avatar
                      key={member.id}
                      name={member.name}
                      size="sm"
                      className="ring-2 ring-background"
                    />
                  ))}
                </div>
                <span className="truncate text-muted-foreground">
                  {booking.team
                    .map((member) => member.name.split(" ")[0])
                    .join(", ")}
                </span>
              </div>
            ) : (
              <Badge tone="neutral">Team to be assigned</Badge>
            )}
            <span className="flex shrink-0 items-center gap-1 font-medium text-blue-700">
              Details <ArrowRight className="size-4" />
            </span>
          </div>
        )}
      </Card>
    </Link>
  );

  return (
    <>
      <PageHeader
        title="My bookings"
        description="Confirmed cleanings and your service history."
      />
      {!bookings.length ? (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="No bookings yet"
            description="Bookings are created once you accept and pay for a quote."
            action={
              <Button href="/dashboard/request-cleaning">
                Request a cleaning
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold text-foreground">Upcoming</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((booking) => bookingCard(booking))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold text-foreground">Past</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {past.map((booking) => bookingCard(booking, true))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
