"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import { Timeline, type TimelineItem } from "@/components/kit/Timeline";
import { ConfirmDialog } from "@/components/kit/Dialog";
import { RequestSummary } from "@/components/shared/RequestSummary";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  cancelCustomerRequest,
  getCustomerRequest,
} from "@/lib/api/services/cleaning-request.service";
import { requestStatus } from "@/lib/status";
import { fmtDate } from "@/lib/utils";

const requestKey = (reference: string) => ["customer-request", reference] as const;

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);
  const query = useQuery({
    queryKey: requestKey(id),
    queryFn: () => getCustomerRequest(id),
    enabled: !!id,
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelCustomerRequest(id),
    onSuccess: async () => {
      setCancelOpen(false);
      toast.success("Request cancelled");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: requestKey(id) }),
        queryClient.invalidateQueries({ queryKey: ["customer-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["customer-dashboard"] }),
      ]);
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

  const { request, customer, quote, booking, inspection } = query.data;
  const canCancel = ["new", "under_review", "inspection_required"].includes(request.status);
  const quoteDone = Boolean(quote);
  const accepted = quote?.status === "accepted";
  const requestTimeline: TimelineItem[] = [
    {
      title: "Request submitted",
      description: "We’ve received your cleaning request.",
      date: fmtDate(request.createdAt),
      state: "done",
    },
    {
      title: "Under review",
      description: "Our team is reviewing your requirements.",
      state: ["new", "under_review"].includes(request.status) ? "current" : "done",
    },
    {
      title: "Inspection",
      description: inspection?.scheduledAt
        ? `Scheduled for ${fmtDate(inspection.scheduledAt)}.`
        : "Only needed for larger or complex spaces.",
      state: inspection ? (inspection.status === "completed" ? "done" : "current") : quoteDone ? "skipped" : "upcoming",
    },
    {
      title: "Quote sent",
      description: quote ? `Quote ${quote.quoteNumber} is ready.` : undefined,
      state: quoteDone ? "done" : ["inspection_required"].includes(request.status) ? "upcoming" : "current",
    },
    {
      title: "Quote accepted",
      description: accepted ? "You accepted the quotation." : undefined,
      state: accepted ? "done" : quoteDone ? "current" : "upcoming",
    },
    {
      title: "Booking confirmed",
      description: booking ? booking.bookingNumber : undefined,
      state: booking ? "done" : accepted ? "current" : "upcoming",
    },
  ];

  return (
    <>
      <PageHeader
        back={{ href: "/dashboard/requests", label: "My requests" }}
        title={request.reference}
        meta={<StatusBadge status={request.status} map={requestStatus} />}
        description={`${request.services.join(", ")} · Submitted ${fmtDate(request.createdAt)}`}
        actions={(
          <>
            {quote?.status === "sent" && <Button href={`/dashboard/quotes/${quote.id}`}>Review quote</Button>}
            {accepted && !booking && <Button href={`/dashboard/payment/${quote.id}`}>Continue to payment</Button>}
            {booking && <Button href={`/dashboard/bookings/${booking.id}`} variant="secondary">View booking</Button>}
            {canCancel && <Button variant="ghost" className="text-red-700 hover:bg-red-50" onClick={() => setCancelOpen(true)}>Cancel request</Button>}
          </>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <RequestSummary r={request} />
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Progress" />
            <CardBody><Timeline items={requestTimeline} /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Your details" />
            <CardBody>
              <DetailList cols={1} items={[
                { label: "Name", value: customer?.name ?? "—" },
                { label: "Phone", value: customer?.phone ?? "—" },
                { label: "Email", value: customer?.email ?? "—" },
              ]} />
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        loading={cancelMutation.isPending}
        tone="danger"
        title="Cancel this request?"
        description="This request will be closed and our team will stop working on it. You can submit a new request at any time."
        confirmLabel="Cancel request"
      />
    </>
  );
}