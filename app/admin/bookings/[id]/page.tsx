"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import { Avatar } from "@/components/kit/Misc";
import { Select } from "@/components/kit/Field";
import { ConfirmDialog, Dialog } from "@/components/kit/Dialog";
import { CheckboxCard } from "@/components/kit/Choice";
import { bookingStatus } from "@/lib/status";
import { naira } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getAdminBooking,
  updateAdminBooking,
  type AdminBookingUpdate,
} from "@/lib/api/services/admin-booking.service";
import { getAdminStaff } from "@/lib/api/services/admin-staff.service";

const bookingKey = (id: string) => ["admin-booking", id] as const;
const statusOptions = [
  { value: "confirmed", label: bookingStatus.confirmed.label },
  { value: "assigned", label: "Staff assigned" },
  { value: "en_route", label: bookingStatus.en_route.label },
  { value: "arrived", label: bookingStatus.arrived.label },
  { value: "in_progress", label: bookingStatus.in_progress.label },
  { value: "completed", label: bookingStatus.completed.label },
  { value: "cancelled", label: bookingStatus.cancelled.label },
];

function displayStatus(status: string) {
  return status === "assigned" ? "staff_assigned" : status;
}

function formatDate(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value))
    : "Not scheduled";
}

function formatTime(value: string | null | undefined) {
  if (!value) return "Time to be confirmed";
  if (/^\d{1,2}:\d{2}/.test(value)) return value;
  return new Intl.DateTimeFormat("en-NG", { timeStyle: "short" }).format(new Date(value));
}

export default function AdminBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [cancel, setCancel] = useState(false);
  const detailQuery = useQuery({
    queryKey: bookingKey(id),
    queryFn: () => getAdminBooking(id),
    enabled: !!id,
  });
  const staffQuery = useQuery({
    queryKey: ["admin-staff"],
    queryFn: getAdminStaff,
    enabled: assignOpen,
  });
  const updateMutation = useMutation({
    mutationFn: (update: AdminBookingUpdate) => updateAdminBooking(id, update),
    onSuccess: async (booking) => {
      queryClient.setQueryData(bookingKey(id), booking);
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setAssignOpen(false);
      setCancel(false);
      toast.success("Booking updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (detailQuery.isLoading) return <PageSkeleton />;
  if (detailQuery.error || !detailQuery.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(detailQuery.error) || "Booking not found."}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const data = detailQuery.data;
  const booking = data.booking;
  const request = data.request;
  const customer = data.customer;
  const closed = ["completed", "cancelled"].includes(booking.status);
  const scheduledDate = booking.scheduledFor ?? request?.preferredDate;
  const scheduledTime = booking.scheduledFor ?? request?.preferredTime;
  const availableStaff = (staffQuery.data ?? []).filter(
    (staff) => staff.active && staff.role !== "Inspector",
  );
  const openAssignment = () => {
    setSelectedStaff(booking.assignedStaffIds);
    setAssignOpen(true);
  };
  const toggleStaff = (staffId: string) => {
    setSelectedStaff((current) =>
      current.includes(staffId)
        ? current.filter((id) => id !== staffId)
        : [...current, staffId],
    );
  };

  return (
    <>
      <PageHeader
        back={{ href: "/admin/bookings", label: "Bookings" }}
        title={request?.services.join(", ") || "Cleaning booking"}
        meta={<StatusBadge status={displayStatus(booking.status)} map={bookingStatus} />}
        description={`${booking.bookingNumber} · ${customer?.name ?? "Unknown customer"}`}
        actions={!closed && (
          <>
            <Button onClick={openAssignment}>
              <UserPlus className="h-4 w-4" />
              {booking.assignedStaffIds.length ? "Change staff" : "Assign staff"}
            </Button>
            <Button
              variant="ghost"
              className="text-red-700 hover:bg-red-50"
              onClick={() => setCancel(true)}
            >
              Cancel booking
            </Button>
          </>
        )}
      />
      {!closed && (
        <Card className="mb-6">
          <CardHeader
            title="Job progress"
            description="Update the booking status as the job progresses."
            action={
              <div className="w-44">
                <Select
                  aria-label="Set booking status"
                  value={booking.status}
                  onChange={(event) =>
                    updateMutation.mutate({ status: event.target.value as AdminBookingUpdate["status"] })
                  }
                  options={statusOptions}
                />
              </div>
            }
          />
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Job details" />
            <CardBody>
              <DetailList items={[
                { label: "Date", value: formatDate(scheduledDate) },
                { label: "Time", value: formatTime(scheduledTime) },
                { label: "Location", value: request?.location || "Not provided" },
                { label: "Amount", value: naira(booking.amountKobo / 100) },
                { label: "Request", value: request?.reference ?? "—" },
                { label: "Payment", value: data.payment ? `${data.payment.reference} (${data.payment.status})` : "—" },
                { label: "Instructions", value: request?.instructions || "—" },
              ]} />
            </CardBody>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Assigned staff" />
            {data.staff.length ? (
              <ul className="divide-y divide-border">
                {data.staff.map((staff) => (
                  <li key={staff.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={staff.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.role} · {staff.phone}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <CardBody>
                <p className="text-sm text-muted-foreground">No one is assigned yet.</p>
                {!closed && <Button size="sm" className="mt-3" onClick={openAssignment}>Assign staff</Button>}
              </CardBody>
            )}
          </Card>
          <Card>
            <CardHeader title="Customer" />
            <CardBody>
              <DetailList cols={1} items={[
                { label: "Name", value: customer?.name ?? "Unknown customer" },
                { label: "Phone", value: customer?.phone || "—" },
                { label: "Email", value: customer?.email || "—" },
              ]} />
            </CardBody>
          </Card>
        </div>
      </div>
      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign staff"
        description="Select the team members who will work this job."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate({ staffIds: selectedStaff })}
              loading={updateMutation.isPending}
            >
              Save ({selectedStaff.length} selected)
            </Button>
          </>
        }
      >
        {staffQuery.isLoading ? (
          <p className="py-4 text-sm text-muted-foreground">Loading staff…</p>
        ) : staffQuery.error ? (
          <p className="py-4 text-sm text-red-700">{getApiErrorMessage(staffQuery.error)}</p>
        ) : availableStaff.length ? (
          <ul className="space-y-2">
            {availableStaff.map((staff) => (
              <li key={staff.id}>
                <CheckboxCard
                  checked={selectedStaff.includes(staff.id)}
                  onCheckedChange={() => toggleStaff(staff.id)}
                  className="flex items-center"
                >
                  <Avatar name={staff.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{staff.name}</span>
                    <span className="block text-xs text-muted-foreground">{staff.role} · {staff.availability.replace("_", " ")}</span>
                  </span>
                </CheckboxCard>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No active staff are available for assignment.</p>
        )}
      </Dialog>
      <ConfirmDialog
        open={cancel}
        onClose={() => setCancel(false)}
        onConfirm={() => updateMutation.mutate({ status: "cancelled" })}
        loading={updateMutation.isPending}
        tone="danger"
        title="Cancel this booking?"
        description="This will mark the booking as cancelled. Handle any refund from the Payments page."
        confirmLabel="Cancel booking"
      />
    </>
  );
}
