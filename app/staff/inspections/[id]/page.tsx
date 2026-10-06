"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, MapPin, Play, Phone } from "lucide-react";

import {
  useCompleteStaffInspection,
  useSaveStaffInspectionReport,
  useStaffInspection,
  useStartStaffInspection,
} from "@/lib/hooks/queries/use-staff-inspections";

import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import { Select, Input, Textarea } from "@/components/kit/Field";

import {
  FileUploader,
  PhotoGrid,
  type UploadedFile,
} from "@/components/kit/FileUploader";

import { inspectionStatus } from "@/lib/status";
import { fmtLong, fmtTime } from "@/lib/utils";

const conditions = [
  "Light: regular upkeep",
  "Moderate: visible build-up",
  "Heavy: neglected or very soiled",
  "Post-construction debris",
].map((value) => ({
  value,
  label: value,
}));

export default function StaffInspectionDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: inspection,
    isLoading,
    error,
    refetch,
  } = useStaffInspection(id);

  const startMutation = useStartStaffInspection();
  const saveReportMutation = useSaveStaffInspectionReport();
  const completeMutation = useCompleteStaffInspection();

  const [form, setForm] = useState({
    condition: "",
    size: "",
    duration: "",
    additionalServices: "",
    specialRequirements: "",
    notes: "",
  });

  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inspection?.report) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      condition: inspection.report.condition ?? "",
      size: inspection.report.size ?? "",
      duration: inspection.report.duration ?? "",
      additionalServices: inspection.report.additionalServices ?? "",
      specialRequirements: inspection.report.specialRequirements ?? "",
      notes: inspection.report.notes ?? "",
    });

    setPhotos(
      (inspection.report.photos ?? []).map((url, index) => ({
        id: `saved-photo-${index}-${url}`,
        name: url.split("/").pop() || `Inspection photo ${index + 1}`,
        url,
      })),
    );
  }, [inspection]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !inspection) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : "Inspection not found."
        }
        onRetry={() => refetch()}
      />
    );
  }

  const report = inspection.report;
  const editable = inspection.status === "in_progress";
  const showReadOnlyReport =
    inspection.status === "completed" && !!inspection.report;
  const scheduledDate = new Date(inspection.scheduledAt);
  const hasValidScheduledDate = !Number.isNaN(scheduledDate.getTime());

  const setField =
    (key: keyof typeof form) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((current) => ({
        ...current,
        [key]: event.target.value,
      }));
    };

  const requiredError = (key: "condition" | "size" | "duration") => {
    return touched && !form[key] ? "Required" : undefined;
  };

  const start = async () => {
    try {
      await startMutation.mutateAsync(inspection.id);

      toast.success("Inspection started.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start inspection.",
      );
    }
  };

  const saveReport = async () => {
    if (!inspection) return;

    if (!form.condition.trim() || !form.size.trim() || !form.duration.trim()) {
      setTouched(true);
      toast.error("Please complete the required report fields.");
      return;
    }

    try {
      await saveReportMutation.mutateAsync({
        id: inspection.id,
        input: {
          condition: form.condition.trim(),
          size: form.size.trim(),
          duration: form.duration.trim(),
          additionalServices: form.additionalServices.trim(),
          specialRequirements: form.specialRequirements.trim(),
          notes: form.notes.trim(),

          // These should eventually be permanent uploaded URLs.
          photos: photos.map((photo) => photo.url),
        },
      });

      toast.success("Report saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save report.",
      );
    }
  };

  const complete = async () => {
    setTouched(true);

    if (!form.condition || !form.size || !form.duration) {
      toast.error("Complete the required fields first.");
      return;
    }

    try {
      await completeMutation.mutateAsync({
        id: inspection.id,
        input: {
          condition: form.condition,
          size: form.size,
          duration: form.duration,
          additionalServices: form.additionalServices || undefined,
          specialRequirements: form.specialRequirements || undefined,
          notes: form.notes || undefined,
          photos: photos.map((photo) => photo.url),
        },
      });

      toast.success("Inspection completed.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete inspection.",
      );
    }
  };

  return (
    <>
      <Link
        href="/staff/inspections"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        My inspections
      </Link>

      <PageHeader
        title={inspection.requestReference}
        meta={<StatusBadge status={inspection.status} map={inspectionStatus} />}
        description={`Inspection for ${inspection.customer.name}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {!showReadOnlyReport ? (
            <Card>
              <CardHeader title="Inspection report" />

              <CardBody className="space-y-5">
                <DetailList
                  items={[
                    {
                      label: "Property condition",
                      value: report?.condition ?? "—",
                    },
                    {
                      label: "Property size",
                      value: report?.size ?? "—",
                    },
                    {
                      label: "Estimated duration",
                      value: report?.duration ?? "—",
                    },
                    {
                      label: "Suggested extra services",
                      value: report?.additionalServices ?? "—",
                    },
                    {
                      label: "Special requirements",
                      value: report?.specialRequirements ?? "—",
                    },
                  ]}
                />

                <DetailList
                  cols={1}
                  items={[
                    {
                      label: "Notes",
                      value: report?.notes ?? "—",
                    },
                  ]}
                />

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Photos ({report?.photos.length})
                  </p>

                  {report?.photos.length ? (
                    <PhotoGrid photos={report?.photos} alt="Inspection photo" />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No inspection photos.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Inspection report complete.
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader
                title="Inspection report"
                description={
                  editable
                    ? "Fill this in while inspecting the property."
                    : inspection.status === "scheduled"
                      ? "Start the inspection when you arrive."
                      : inspection.status === "cancelled"
                        ? "This inspection was cancelled."
                        : "No report was recorded."
                }
              />

              <CardBody>
                <fieldset
                  disabled={!editable}
                  className="space-y-4 disabled:opacity-60"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Property condition"
                      required
                      placeholder="Select"
                      options={conditions}
                      value={form.condition}
                      onChange={setField("condition")}
                      error={requiredError("condition")}
                    />

                    <Input
                      label="Property size"
                      required
                      placeholder="e.g. 140 sqm, 3 bedrooms"
                      value={form.size}
                      onChange={setField("size")}
                      error={requiredError("size")}
                    />

                    <Input
                      label="Estimated cleaning duration"
                      required
                      placeholder="e.g. 6 hours, team of 3"
                      value={form.duration}
                      onChange={setField("duration")}
                      error={requiredError("duration")}
                    />

                    <Input
                      label="Additional services"
                      placeholder="e.g. Sofa cleaning"
                      value={form.additionalServices}
                      onChange={setField("additionalServices")}
                    />
                  </div>

                  <Textarea
                    label="Special requirements"
                    rows={2}
                    value={form.specialRequirements}
                    onChange={setField("specialRequirements")}
                  />

                  <Textarea
                    label="Notes"
                    rows={3}
                    value={form.notes}
                    onChange={setField("notes")}
                  />

                  <FileUploader
                    label="Inspection photos"
                    value={photos}
                    onChange={setPhotos}
                    max={8}
                    compact
                  />
                </fieldset>

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={saveReport}
                    disabled={
                      saveReportMutation.isPending || completeMutation.isPending
                    }
                  >
                    {saveReportMutation.isPending ? "Saving..." : "Save Report"}
                  </Button>

                  <Button
                    type="button"
                    onClick={complete}
                    disabled={
                      saveReportMutation.isPending || completeMutation.isPending
                    }
                  >
                    {completeMutation.isPending
                      ? "Completing..."
                      : "Complete Inspection"}
                  </Button>
                </div>

                {inspection.status === "scheduled" && (
                  <Button
                    size="lg"
                    className="mt-5 w-full sm:w-auto"
                    onClick={start}
                    loading={startMutation.isPending}
                  >
                    <Play className="h-4 w-4" />
                    Start inspection
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-5">
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
                    value: [
                      inspection.address.addressLine1,
                      inspection.address.addressLine2,
                      inspection.address.area,
                      inspection.address.city,
                      inspection.address.state,
                    ]
                      .filter(Boolean)
                      .join(", "),
                  },
                  {
                    label: "Landmark",
                    value: inspection.address.landmark ?? "—",
                  },
                ]}
              />

              <a
                href={`tel:${inspection.customer.phone ?? ""}`}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-primary"
              >
                <Phone className="h-4 w-4" />
                Call customer
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [
                    inspection.address.addressLine1,
                    inspection.address.area,
                    inspection.address.city,
                    inspection.address.state,
                  ]
                    .filter(Boolean)
                    .join(", "),
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-primary"
              >
                <MapPin className="h-4 w-4" />
                Open in Maps
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Customer request" />

            <CardBody className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                {inspection.requestedServices
                  .map((service) => service.name)
                  .join(", ")}
              </p>

              {inspection.requestNotes && (
                <p className="text-muted-foreground">
                  {inspection.requestNotes}
                </p>
              )}

              <p className="text-muted-foreground">
                {inspection.customer.name}
                {inspection.customer.phone
                  ? ` · ${inspection.customer.phone}`
                  : ""}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
