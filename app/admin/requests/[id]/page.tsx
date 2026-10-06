"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, PlayCircle, Search, XCircle } from "lucide-react";

import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";

import { Button } from "@/components/kit/Button";

import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";

import { StatusBadge } from "@/components/kit/Badge";
import { Dialog } from "@/components/kit/Dialog";
import { Textarea } from "@/components/kit/Field";

import { RequestSummary } from "@/components/shared/RequestSummary";
import { ScheduleInspectionDialog } from "@/components/shared/ScheduleInspectionDialog";

import { requestStatus } from "@/lib/status";
import { fmtDate } from "@/lib/utils";
import {
  useAdminCleaningRequest,
  useUpdateAdminCleaningRequestStatus,
} from "@/lib/hooks/queries/use-admin-cleaning-requests";

export default function AdminRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [inspOpen, setInspOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  const { data, isLoading, error, refetch } = useAdminCleaningRequest(id);

  const statusMutation = useUpdateAdminCleaningRequestStatus(id);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Request not found"}
        onRetry={() => refetch()}
      />
    );
  }

  const { request: r, customer: c, quote, booking, inspection: insp } = data;

  const startReview = async () => {
    try {
      await statusMutation.mutateAsync({
        status: "reviewing",
      });

      toast.success("Review started.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start review.",
      );
    }
  };

  const reject = async () => {
    if (!note.trim()) return;

    try {
      await statusMutation.mutateAsync({
        status: "declined",
        note: note.trim(),
      });

      setNote("");
      setRejectOpen(false);

      toast.success("Request declined.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to decline request.",
      );
    }
  };

  const canQuote =
    ["reviewing", "inspection_required"].includes(r.status) &&
    (!insp || insp.status === "completed" || insp.status === "cancelled");

  const closed = ["declined", "cancelled", "converted"].includes(r.status);

  return (
    <>
      <PageHeader
        back={{
          href: "/admin/requests",
          label: "Requests",
        }}
        title={r.reference}
        meta={<StatusBadge status={r.status} map={requestStatus} />}
        description={`${c.name} · Submitted ${fmtDate(r.createdAt)}`}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={startReview}
              loading={statusMutation.isPending}
              disabled={r.status !== "submitted"}
            >
              <PlayCircle className="h-4 w-4" />
              Start review
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                insp
                  ? router.push(`/admin/inspections/${insp.id}`)
                  : setInspOpen(true)
              }
              disabled={closed || ["quoted", "accepted"].includes(r.status)}
            >
              <Search className="h-4 w-4" />

              {insp ? "Open inspection" : "Schedule inspection"}
            </Button>

            <Button
              href={`/admin/quotes/create?request=${r.id}`}
              disabled={!canQuote}
            >
              <FileText className="h-4 w-4" />
              Create quote
            </Button>

            <Button
              variant="ghost"
              className="text-red-700 hover:bg-red-50"
              onClick={() => setRejectOpen(true)}
              disabled={closed || ["accepted", "quoted"].includes(r.status)}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </>
        }
      />

      {r.status === "submitted" && (
        <p className="-mt-3 mb-5 text-sm text-muted-foreground">
          Start the review to unlock inspection and quoting.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RequestSummary r={r} />
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Customer" />

            <CardBody>
              <DetailList
                cols={1}
                items={[
                  {
                    label: "Name",
                    value: (
                      <a
                        className="text-blue-700 hover:underline"
                        href={`/admin/customers/${c.id}`}
                      >
                        {c.name}
                      </a>
                    ),
                  },
                  {
                    label: "Phone",
                    value: c.phone ?? "—",
                  },
                  {
                    label: "Email",
                    value: c.email ?? "—",
                  },
                  {
                    label: "Account",
                    value: c.hasAccount
                      ? "Has an account"
                      : "Guest. Verifies by email or phone to view the quote.",
                  },
                ]}
              />
            </CardBody>
          </Card>

          {quote && (
            <Card>
              <CardHeader title="Quote" />

              <CardBody>
                <DetailList
                  cols={1}
                  items={[
                    {
                      label: "Quote number",
                      value: quote.quoteNumber,
                    },
                    {
                      label: "Status",
                      value: quote.status,
                    },
                    {
                      label: "Total",
                      value: `₦${(quote.totalKobo / 100).toLocaleString()}`,
                    },
                  ]}
                />

                <Button
                  href="/admin/quotes"
                  variant="secondary"
                  full
                  className="mt-4"
                >
                  View quote
                </Button>
              </CardBody>
            </Card>
          )}

          {booking && (
            <Button
              href={`/admin/bookings/${booking.id}`}
              variant="secondary"
              full
            >
              View booking {booking.bookingNumber}
            </Button>
          )}
        </div>
      </div>

      <ScheduleInspectionDialog
        open={inspOpen}
        onClose={() => setInspOpen(false)}
        onDone={() => refetch()}
        requestId={r.id}
      />

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject this request?"
        description="The customer will see your reason. Use this when the job is outside your services or area."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Keep request
            </Button>

            <Button
              variant="danger"
              onClick={reject}
              loading={statusMutation.isPending}
              disabled={!note.trim()}
            >
              Reject request
            </Button>
          </>
        }
      >
        <Textarea
          label="Reason"
          required
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="e.g. This location is outside our service area."
        />
      </Dialog>
    </>
  );
}
