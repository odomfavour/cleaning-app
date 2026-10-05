"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  Plus,
  Star,
} from "lucide-react";

import { Button } from "@/components/kit/Button";
import { Card, CardHeader } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PageSkeleton,
  StatCard,
} from "@/components/kit/Page";
import { bookingStatus, requestStatus } from "@/lib/status";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getCustomerDashboard } from "@/lib/api/services/customer-dashboard.service";
import { fmtDate, naira } from "@/lib/utils";

function statusForBadge(status: string) {
  return status === "assigned" ? "staff_assigned" : status;
}

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "Schedule pending";
}

function formatTime(value: string | null) {
  if (!value) return "";
  if (/^\d{1,2}:\d{2}/.test(value)) return value;
  return new Intl.DateTimeFormat("en-NG", { timeStyle: "short" }).format(
    new Date(value),
  );
}

export default function CustomerDashboard() {
  const query = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: getCustomerDashboard,
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

  const { customer, requests, bookings, activity } = query.data;
  const pendingRequests = requests.filter((request) =>
    ["new", "under_review", "inspection_required"].includes(request.status),
  );
  const awaitingQuotes = requests.filter(
    (request) => request.quote?.status === "sent",
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const openBookings = bookings
    .filter(
      (booking) =>
        !["completed", "cancelled"].includes(booking.status) &&
        (!booking.date || new Date(booking.date) >= today),
    )
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  );
  const toReview = completedBookings.find((booking) => booking.reviewNeeded);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${customer.firstName}`}
        description="Here’s where your cleaning requests and bookings stand."
        actions={
          <Button
            href="/dashboard/request-cleaning"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Request a cleaning
          </Button>
        }
      />

      <div className="space-y-3">
        {awaitingQuotes.map((request) => (
          <Card
            key={request.quote?.id}
            className="flex flex-col gap-4 border-amber-200 bg-amber-50/60 p-5 sm:flex-row sm:items-center"
          >
            <FileText className="size-5 shrink-0 text-amber-700" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Your quote {request.quote?.quoteNumber} is ready
              </p>
              <p className="text-sm text-muted-foreground">
                {request.services.join(", ")} ·{" "}
                {naira((request.quote?.totalKobo ?? 0) / 100)}
                {request.quote?.expiresAt
                  ? ` · valid until ${fmtDate(request.quote.expiresAt)}`
                  : ""}
              </p>
            </div>
            <Button href={`/dashboard/quotes/${request.quote?.id}`}>
              Review quote
              <ArrowRight className="size-4" />
            </Button>
          </Card>
        ))}
        {toReview && (
          <Card className="flex flex-col gap-3 border-blue-200 bg-blue-50/60 p-5 sm:flex-row sm:items-center">
            <Star className="size-5 shrink-0 text-blue-700" />
            <p className="flex-1 text-sm">
              <strong>How was your {toReview.title.toLowerCase()}?</strong> Your
              feedback helps us keep standards high.
            </p>
            <Button
              href={`/dashboard/bookings/${toReview.id}/review`}
              variant="secondary"
              size="sm"
            >
              Leave a review
            </Button>
          </Card>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending requests"
          value={pendingRequests.length}
          icon={ClipboardList}
          href="/dashboard/requests"
          tone="violet"
        />
        <StatCard
          label="Quotes awaiting you"
          value={awaitingQuotes.length}
          icon={FileText}
          href={
            awaitingQuotes[0]?.quote
              ? `/dashboard/quotes/${awaitingQuotes[0].quote.id}`
              : "/dashboard/requests"
          }
          tone="amber"
        />
        <StatCard
          label="Upcoming cleanings"
          value={openBookings.length}
          icon={CalendarCheck}
          href="/dashboard/bookings"
          tone="blue"
        />
        <StatCard
          label="Completed jobs"
          value={completedBookings.length}
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-primary">
              Upcoming booking
            </h2>
            {openBookings[0] ? (
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {openBookings[0].bookingNumber}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-primary">
                      {openBookings[0].title}
                    </h3>
                  </div>
                  <StatusBadge
                    status={statusForBadge(openBookings[0].status)}
                    map={bookingStatus}
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formatDate(openBookings[0].date)}
                  {openBookings[0].time
                    ? ` at ${formatTime(openBookings[0].time)}`
                    : ""}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {openBookings[0].location}
                </p>
                {openBookings[0].staff.length > 0 && (
                  <p className="mt-3 text-sm">
                    Your team:{" "}
                    {openBookings[0].staff
                      .map((member) => member.name)
                      .join(", ")}
                  </p>
                )}
              </Card>
            ) : (
              <Card>
                <EmptyState
                  icon={CalendarCheck}
                  title="No upcoming cleanings"
                  description="Once you accept and pay for a quote, your booking will appear here."
                  action={
                    <Button
                      href="/dashboard/request-cleaning"
                      variant="secondary"
                    >
                      Request a cleaning
                    </Button>
                  }
                />
              </Card>
            )}
          </section>
          <Card>
            <CardHeader
              title="Recent requests"
              action={
                <Link
                  href="/dashboard/requests"
                  className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
                >
                  View all
                  <ArrowRight className="size-3.5" />
                </Link>
              }
            />
            {requests.length === 0 ? (
              <EmptyState
                title="No requests yet"
                description="Tell us what needs cleaning and we’ll send you a quote."
                action={
                  <Button href="/dashboard/request-cleaning">
                    Request a cleaning
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {requests.slice(0, 5).map((request) => (
                  <li key={request.id}>
                    <Link
                      href={
                        request.quote
                          ? `/dashboard/quotes/${request.quote.id}`
                          : "/dashboard/requests"
                      }
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {request.services.join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.reference} · {fmtDate(request.submittedAt)}
                          {request.quote
                            ? ` · ${naira(request.quote.totalKobo / 100)}`
                            : ""}
                        </p>
                      </div>
                      <StatusBadge
                        status={request.status}
                        map={requestStatus}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader title="Recent activity" />
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ul className="divide-y divide-border">
              {activity.slice(0, 5).map((item) => (
                <li key={item.id} className="flex gap-3 px-5 py-3.5">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-600" />
                  <div className="min-w-0">
                    <Link
                      href={item.href}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground/70">
                      {fmtDate(item.time)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
