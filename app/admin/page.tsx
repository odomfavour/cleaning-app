"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
} from "lucide-react";

import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PageSkeleton,
  StatCard,
} from "@/components/kit/Page";
import { BarChart } from "@/components/kit/Charts";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getAdminDashboard } from "@/lib/api/services/admin-dashboard.service";
import { bookingStatus, requestStatus } from "@/lib/status";
import { fmtDate, naira } from "@/lib/utils";

function displayBookingStatus(status: string) {
  return status === "assigned" ? "staff_assigned" : status;
}

function displayRequestStatus(status: string) {
  switch (status) {
    case "submitted":
      return "new";
    case "reviewing":
      return "under_review";
    case "inspection_scheduled":
      return "inspection_required";
    case "quoted":
      return "quote_sent";
    case "converted":
      return "accepted";
    default:
      return status;
  }
}

export default function AdminDashboard() {
  const query = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
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

  const { stats, requests, bookings, weeklyRevenue, activity } = query.data;
  const newRequests = requests.filter(
    (request) => request.status === "submitted",
  );
  const firstUnassigned = bookings.find((booking) => booking.unassigned);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="What needs attention today."
        actions={
          <Button href="/admin/quotes/create">
            <FileText className="h-4 w-4" />
            Create quote
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard
          label="Requests today"
          value={stats.requestsToday}
          icon={ClipboardList}
          tone="violet"
          href="/admin/requests"
        />
        <StatCard
          label="Awaiting a quote"
          value={stats.needsQuote}
          icon={FileText}
          tone="amber"
          href="/admin/requests"
        />
        <StatCard
          label="Upcoming jobs"
          value={stats.upcomingBookings}
          icon={CalendarClock}
          tone="blue"
          href="/admin/bookings"
        />
        <StatCard
          label="Completed jobs"
          value={stats.completedBookings}
          icon={CheckCircle2}
          tone="green"
        />
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            label="Revenue (8 weeks)"
            value={naira(stats.paidRevenueKobo / 100)}
            icon={Banknote}
            tone="green"
            href="/admin/payments"
          />
        </div>
      </div>

      {(newRequests.length > 0 || stats.unassignedBookings > 0) && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {newRequests.length > 0 && (
            <Card className="flex items-center gap-3 border-violet-200 bg-violet-50/60 p-4">
              <p className="flex-1 text-sm text-foreground">
                <strong>
                  {newRequests.length} new{" "}
                  {newRequests.length === 1 ? "request needs" : "requests need"}{" "}
                  review.
                </strong>
              </p>
              <Button size="sm" href="/admin/requests">
                Review
              </Button>
            </Card>
          )}
          {stats.unassignedBookings > 0 && (
            <Card className="flex items-center gap-3 border-amber-200 bg-amber-50/60 p-4">
              <p className="flex-1 text-sm text-foreground">
                <strong>
                  {stats.unassignedBookings} upcoming{" "}
                  {stats.unassignedBookings === 1
                    ? "booking has"
                    : "bookings have"}{" "}
                  no staff assigned.
                </strong>
              </p>
              <Button
                size="sm"
                href={
                  firstUnassigned
                    ? `/admin/bookings/${firstUnassigned.id}`
                    : "/admin/bookings"
                }
              >
                Assign
              </Button>
            </Card>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue, last 8 weeks"
            description="Paid transactions, in naira"
          />
          <CardBody className="pt-8">
            <BarChart data={weeklyRevenue} format={(value) => naira(value)} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Upcoming jobs"
            action={
              <Link
                href="/admin/calendar"
                className="text-sm font-medium text-blue-700 hover:underline"
              >
                Calendar
              </Link>
            }
          />
          {bookings.length === 0 ? (
            <EmptyState title="Nothing scheduled" />
          ) : (
            <ul className="divide-y divide-border">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="block px-5 py-3 hover:bg-muted/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {booking.title}
                      </p>
                      <StatusBadge
                        status={displayBookingStatus(booking.status)}
                        map={bookingStatus}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {booking.customer} ·{" "}
                      {booking.scheduledFor
                        ? fmtDate(booking.scheduledFor)
                        : "Schedule pending"}
                      {booking.preferredTime
                        ? `, ${booking.preferredTime}`
                        : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent requests"
            action={
              <Link
                href="/admin/requests"
                className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
              >
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {requests.length === 0 ? (
            <EmptyState title="No requests yet" />
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((request) => (
                <li key={request.id}>
                  <Link
                    href={`/admin/requests/${request.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {request.customer}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {request.reference} · {request.services.join(", ")}
                      </p>
                    </div>
                    <StatusBadge
                      status={displayRequestStatus(request.status)}
                      map={requestStatus}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title="Activity" />
          {activity.length === 0 ? (
            <EmptyState title="No recent activity" />
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((item) => (
                <li key={item.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.customer} · {fmtDate(item.at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
