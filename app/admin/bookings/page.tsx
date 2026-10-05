"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { Tabs } from "@/components/kit/Tabs";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { StatusBadge } from "@/components/kit/Badge";
import { Badge } from "@/components/kit/Badge";
import { bookingStatus } from "@/lib/status";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getAdminBookings,
  type AdminBooking,
} from "@/lib/api/services/admin-booking.service";
import { fmtDate, naira } from "@/lib/utils";

type BookingState = AdminBooking["status"];
type Tab = "all" | BookingState;
const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: bookingStatus.confirmed.label },
  { value: "assigned", label: "Staff assigned" },
  { value: "en_route", label: bookingStatus.en_route.label },
  { value: "arrived", label: bookingStatus.arrived.label },
  { value: "in_progress", label: bookingStatus.in_progress.label },
  { value: "completed", label: bookingStatus.completed.label },
  { value: "cancelled", label: bookingStatus.cancelled.label },
];

function displayStatus(status: BookingState) {
  return status === "assigned" ? "staff_assigned" : status;
}

function formatSchedule(booking: AdminBooking) {
  const date = booking.scheduledFor ?? booking.requestedDate;
  if (!date) return "Not scheduled";

  const time = booking.requestedTime
    ? `, ${booking.requestedTime}`
    : booking.scheduledFor
      ? `, ${new Intl.DateTimeFormat("en-NG", { timeStyle: "short" }).format(new Date(booking.scheduledFor))}`
      : "";

  return `${fmtDate(date)}${time}`;
}

export default function AdminBookingsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const query = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: getAdminBookings,
  });
  const bookings = query.data ?? [];
  const rows = bookings.filter(
    (booking) => tab === "all" || booking.status === tab,
  );
  const error = query.error ? getApiErrorMessage(query.error) : undefined;
  const columns: Column<AdminBooking>[] = [
    {
      key: "id",
      header: "Booking",
      cell: (booking) => booking.bookingNumber,
      mobile: "title",
    },
    {
      key: "cust",
      header: "Customer",
      cell: (booking) => booking.customer.name,
    },
    { key: "svc", header: "Service", cell: (booking) => booking.title },
    { key: "when", header: "Date and time", cell: formatSchedule },
    {
      key: "staff",
      header: "Team",
      cell: (booking) =>
        booking.staff.length ? (
          `${booking.staff.length} assigned`
        ) : (
          <Badge tone="warning">Unassigned</Badge>
        ),
    },
    {
      key: "amt",
      header: "Amount",
      align: "right",
      cell: (booking) => (
        <span className="tabular-nums">{naira(booking.amountKobo / 100)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (booking) => (
        <StatusBadge
          status={displayStatus(booking.status)}
          map={bookingStatus}
        />
      ),
      mobile: "badge",
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (booking) => (
        <Button
          size="sm"
          variant="secondary"
          href={`/admin/bookings/${booking.id}`}
        >
          {booking.staff.length === 0 &&
          !["completed", "cancelled"].includes(booking.status)
            ? "Assign staff"
            : "Open"}
        </Button>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        title="Bookings"
        description="Paid and confirmed cleaning jobs."
      />
      <Card>
        <div className="px-4 pt-1 sm:px-5">
          <Tabs
            tabs={tabs.map((item) => ({
              ...item,
              count: bookings.filter(
                (booking) =>
                  item.value === "all" || booking.status === item.value,
              ).length,
            }))}
            value={tab}
            onChange={setTab}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={query.isLoading}
          error={error}
          onRetry={() => void query.refetch()}
          href={(booking) => `/admin/bookings/${booking.id}`}
          empty={{
            title: "No bookings here",
            description:
              "Bookings appear after a customer accepts and pays for a quote.",
          }}
        />
      </Card>
    </>
  );
}
