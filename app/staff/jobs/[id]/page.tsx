"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Play,
  Sparkles,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar } from "@/components/kit/Misc";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { ConfirmDialog } from "@/components/kit/Dialog";
import { ErrorState, PageSkeleton } from "@/components/kit/Page";
import { StatusBadge } from "@/components/kit/Badge";
import { ProgressTracker } from "@/components/kit/Timeline";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getStaffBooking,
  updateStaffBookingStatus,
  type StaffDashboardJobStatus,
} from "@/lib/api/services/staff-dashboard.service";
import { bookingStatus } from "@/lib/status";
import { BOOKING_STEPS, bookingStepIndex } from "@/lib/timeline";
import { fmtDate, fmtTime } from "@/lib/utils";

const jobKey = (id: string) => ["staff-booking", id] as const;

const nextAction: Partial<Record<StaffDashboardJobStatus, {
  to: "en_route" | "arrived" | "in_progress";
  label: string;
  icon: typeof Play;
  toast: string;
}>> = {
  confirmed: { to: "en_route", label: "I’m on my way", icon: Navigation, toast: "Marked as en route" },
  assigned: { to: "en_route", label: "I’m on my way", icon: Navigation, toast: "Marked as en route" },
  en_route: { to: "arrived", label: "I’ve arrived", icon: MapPin, toast: "Marked as arrived" },
  arrived: { to: "in_progress", label: "Start cleaning", icon: Play, toast: "Cleaning started" },
};

function displayStatus(status: string) {
  return status === "assigned" ? "staff_assigned" : status;
}

export default function StaffJobDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [confirmComplete, setConfirmComplete] = useState(false);
  const query = useQuery({
    queryKey: jobKey(id),
    queryFn: () => getStaffBooking(id),
    enabled: !!id,
  });
  const updateMutation = useMutation({
    mutationFn: (status: "en_route" | "arrived" | "in_progress" | "completed") =>
      updateStaffBookingStatus(id, status),
    onSuccess: async (booking) => {
      queryClient.setQueryData(jobKey(id), booking);
      await queryClient.invalidateQueries({ queryKey: ["staff", "dashboard"] });
      setConfirmComplete(false);
      toast.success(booking.status === "completed" ? "Job completed" : "Job status updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
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

  const job = query.data;
  const action = nextAction[job.status];
  const ActionIcon = action?.icon;
  const completed = job.status === "completed";
  const cancelled = job.status === "cancelled";

  return (
    <>
      <Link href="/staff/jobs" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <ChevronLeft className="size-4" />My jobs
      </Link>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">{job.title}</h1>
          <p className="text-sm text-muted-foreground">{job.bookingNumber}</p>
        </div>
        <StatusBadge status={displayStatus(job.status)} map={bookingStatus} />
      </div>

      {!cancelled && (
        <Card className="mb-4">
          <CardBody className="px-2 py-4">
            <ProgressTracker steps={[...BOOKING_STEPS]} current={bookingStepIndex(job.status)} />
          </CardBody>
        </Card>
      )}

      <Card className="mb-4">
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-blue-700" />
            <div>
              <p className="font-medium text-foreground">{job.date ? fmtDate(job.date) : "Schedule pending"}</p>
              <p className="text-sm text-muted-foreground">{fmtTime(job.time ?? undefined)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-blue-700" />
            <div className="min-w-0 flex-1">
              <p className="text-foreground">{job.location || "Location unavailable"}</p>
              {job.location && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-700"
                >
                  Open in Maps
                </a>
              )}
            </div>
          </div>
          {job.customer && (
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <Avatar name={job.customer.name} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="truncate font-medium text-foreground">{job.customer.name}</p>
              </div>
              {job.customer.phone && (
                <a href={`tel:${job.customer.phone}`} className="flex h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-primary">
                  <Phone className="size-4" />Call
                </a>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {job.instructions && (
        <Card className="mb-4 border-amber-200 bg-amber-50/60">
          <CardBody>
            <p className="text-xs font-semibold text-amber-800">Special instructions</p>
            <p className="mt-1 text-[15px] text-foreground">{job.instructions}</p>
          </CardBody>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader title="Team" />
        <ul className="divide-y divide-border">
          {job.team.map((member) => (
            <li key={member.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar name={member.name} size="sm" />
              <p className="flex-1 text-sm font-medium">{member.name}</p>
              <span className="text-xs text-muted-foreground">{member.role}</span>
            </li>
          ))}
        </ul>
      </Card>

      {completed && (
        <Alert variant="success">
          <CheckCircle2 />
          <AlertDescription className="text-emerald-800">This job is complete.</AlertDescription>
        </Alert>
      )}
      {cancelled && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>This job was cancelled.</AlertDescription>
        </Alert>
      )}

      {(action || job.status === "in_progress") && (
        <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-white p-3 sm:static sm:mt-4 sm:border-0 sm:bg-transparent sm:p-0">
          {action && ActionIcon && (
            <Button
              size="lg"
              full
              onClick={() => updateMutation.mutate(action.to)}
              loading={updateMutation.isPending}
              className="h-14 text-base"
            >
              <ActionIcon className="size-5" />{action.label}
            </Button>
          )}
          {job.status === "in_progress" && (
            <Button
              size="lg"
              full
              variant="success"
              onClick={() => setConfirmComplete(true)}
              className="h-14 text-base"
            >
              <Sparkles className="size-5" />Complete cleaning
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={() => updateMutation.mutate("completed")}
        loading={updateMutation.isPending}
        title="Complete this job?"
        description="This will mark the assigned booking as completed for the customer and your team."
        confirmLabel="Mark as completed"
      />
    </>
  );
}