"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Check, FileText, Hourglass, UserX } from "lucide-react";

import {
  useAdminInspection,
  useUpdateAdminInspectionStatus,
} from "@/lib/hooks/queries/use-admin-inspections";

import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import { PhotoGrid } from "@/components/kit/FileUploader";
import { ConfirmDialog } from "@/components/kit/Dialog";

import { inspectionStatus } from "@/lib/status";
import { fmtLong, fmtTime } from "@/lib/utils";

const steps = [
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
] as const;

function StatusSteps({ status }: { status: string }) {
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((step, index) => {
        const done = currentIndex > index || status === "completed";
        const active = currentIndex === index && status !== "completed";

        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={[
                "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                done
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : active
                    ? "border-blue-600 text-blue-700"
                    : "border-border text-muted-foreground",
              ].join(" ")}
            >
              {done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span
              className={
                done || active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              }
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 h-px w-6 bg-border" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch } = useAdminInspection(id);
  const statusMutation = useUpdateAdminInspectionStatus();

  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : "Inspection not found."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const { inspection, request } = data;

  if (!inspection || !request) {
    return (
      <ErrorState
        message="Inspection details are incomplete."
        onRetry={() => refetch()}
      />
    );
  }

  const status = inspection.status;
  const isScheduled = status === "scheduled";
  const isInProgress = status === "in_progress";
  const isCompleted = status === "completed";
  const isCancelled = status === "cancelled";

  const scheduledDate = new Date(inspection.scheduledAt);
  const hasValidScheduledDate = !Number.isNaN(scheduledDate.getTime());

  const inspectorName = inspection.inspector?.name;
  const report = inspection.report;

  const cancel = async () => {
    try {
      await statusMutation.mutateAsync({
        id: inspection.id,
        status: "cancelled",
      });

      toast.success("Inspection cancelled.");
      setCancelOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel inspection.",
      );
    }
  };

  return (
    <>
      <PageHeader
        back={{
          href: "/admin/inspections",
          label: "Inspections",
        }}
        title={inspection.id}
        meta={<StatusBadge status={status} map={inspectionStatus} />}
        description={`For ${inspection.requestReference} · ${inspection.customer.name}`}
        actions={
          <>
            {/* Admin can only cancel before staff starts */}
            {isScheduled && (
              <Button
                variant="ghost"
                className="text-red-700 hover:bg-red-50"
                onClick={() => setCancelOpen(true)}
              >
                Cancel inspection
              </Button>
            )}

            {isCompleted && (
              <Button
                href={`/admin/quotes/create?request=${inspection.requestId}`}
              >
                <FileText className="h-4 w-4" />
                Create quote
              </Button>
            )}
          </>
        }
      />

      {!isCancelled && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <StatusSteps status={status} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {isCompleted && report ? (
            <Card>
              <CardHeader
                title="Inspection report"
                description={
                  inspectorName
                    ? `Submitted by ${inspectorName}. Read-only.`
                    : "Submitted by staff. Read-only."
                }
              />

              <CardBody className="space-y-5">
                <DetailList
                  items={[
                    {
                      label: "Property condition",
                      value: report.condition ?? "—",
                    },
                    { label: "Property size", value: report.size ?? "—" },
                    {
                      label: "Estimated duration",
                      value: report.duration ?? "—",
                    },
                    {
                      label: "Suggested extra services",
                      value: report.additionalServices ?? "—",
                    },
                    {
                      label: "Special requirements",
                      value: report.specialRequirements ?? "—",
                    },
                  ]}
                />

                <DetailList
                  cols={1}
                  items={[{ label: "Notes", value: report.notes ?? "—" }]}
                />

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Photos ({report.photos.length})
                  </p>

                  {report.photos.length ? (
                    <PhotoGrid photos={report.photos} alt="Inspection photo" />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No inspection photos.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Report complete. You can now create the quote.
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Inspection report" />
              <CardBody>
                {isScheduled && (
                  <div className="flex items-start gap-3 text-sm">
                    <Hourglass className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {inspectorName
                        ? `Waiting for ${inspectorName} to start the visit. Staff will begin and complete the inspection from their side.`
                        : "No inspector is assigned yet. Staff will start the inspection once one is assigned."}
                    </p>
                  </div>
                )}

                {isInProgress && (
                  <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                    <Hourglass className="mt-0.5 h-4 w-4" />
                    <p>
                      {inspectorName ?? "Staff"} is on site and filling in the
                      report. This view is read-only until they submit it.
                    </p>
                  </div>
                )}

                {isCancelled && (
                  <p className="text-sm text-muted-foreground">
                    This inspection was cancelled. You can schedule a new one
                    from the request.
                  </p>
                )}

                {isCompleted && !report && (
                  <p className="text-sm text-muted-foreground">
                    No report was recorded.
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Assignment" />
            <CardBody>
              {inspectorName ? (
                <DetailList
                  cols={1}
                  items={[
                    { label: "Inspector", value: inspectorName },
                    {
                      label: "Responsible for",
                      value: "Starting and completing this inspection",
                    },
                  ]}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <UserX className="h-4 w-4" />
                  No inspector assigned
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Visit" />
            <CardBody>
              <DetailList
                cols={1}
                items={[
                  {
                    label: "Date",
                    value: hasValidScheduledDate
                      ? fmtLong(scheduledDate.toISOString())
                      : "—",
                  },
                  {
                    label: "Time",
                    value: hasValidScheduledDate
                      ? fmtTime(scheduledDate.toISOString())
                      : "—",
                  },
                  {
                    label: "Address",
                    value:
                      [
                        request.address.addressLine1,
                        request.address.addressLine2,
                        request.address.area,
                        request.address.city,
                        request.address.state,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—",
                  },
                  {
                    label: "Landmark",
                    value: request.address.landmark ?? "—",
                  },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Customer & request"
              action={
                <a
                  href={`/admin/requests/${request.id}`}
                  className="text-sm font-medium text-blue-700 hover:underline"
                >
                  Open
                </a>
              }
            />
            <CardBody className="space-y-3 text-sm">
              <DetailList
                cols={1}
                items={[
                  { label: "Customer", value: inspection.customer.name },
                  { label: "Phone", value: inspection.customer.phone ?? "—" },
                  {
                    label: "Services requested",
                    value:
                      request.requestedServices
                        .map((service) => service.name)
                        .join(", ") || "—",
                  },
                ]}
              />

              {request.notes && (
                <p className="rounded-lg bg-muted/50 p-3 text-muted-foreground">
                  {request.notes}
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={cancel}
        loading={statusMutation.isPending}
        tone="danger"
        title="Cancel this inspection?"
        description="The visit will be cancelled and the inspector will no longer be able to start it. You can schedule a new one from the request."
        confirmLabel="Cancel inspection"
      />
    </>
  );
}
