"use client";

import { useMemo, useState } from "react";

import {
  PageHeader,
  PageSkeleton,
  ErrorState,
} from "@/components/kit/Page";
import { Card } from "@/components/kit/Card";
import { Tabs } from "@/components/kit/Tabs";
import { StatusBadge } from "@/components/kit/Badge";
import { Button } from "@/components/kit/Button";
import { DataTable, type Column } from "@/components/kit/DataTable";

import { useStaffInspections } from "@/lib/hooks/queries/use-staff-inspections";
import type { StaffInspection } from "@/lib/api/services/staff-inspections.service";
import { fmtDate, fmtTime } from "@/lib/utils";

type Tab = "all" | "scheduled" | "in_progress" | "completed";

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];
export const inspectionStatus = {
  scheduled: {
    label: "Scheduled",
    tone: "info",
  },
  in_progress: {
    label: "In progress",
    tone: "warning",
  },
  completed: {
    label: "Completed",
    tone: "success",
  },
  cancelled: {
    label: "Cancelled",
    tone: "danger",
  },
} as const;
export default function StaffInspectionsPage() {
  const {
    data: inspections = [],
    isLoading,
    error,
    refetch,
  } = useStaffInspections();

  const [tab, setTab] = useState<Tab>("all");

  const rows = useMemo(() => {
    return inspections
      .filter((inspection) => tab === "all" || inspection.status === tab)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
  }, [inspections, tab]);

  const columns: Column<StaffInspection>[] = [
    {
      key: "request",
      header: "Request",
      cell: (inspection) => inspection.requestReference,
      mobile: "title",
    },
    {
      key: "customer",
      header: "Customer",
      cell: (inspection) => inspection.customer.name,
    },
    {
      key: "when",
      header: "Date and time",
      cell: (inspection) => {
        const date = new Date(inspection.scheduledAt);

        return `${fmtDate(date.toISOString())}, ${fmtTime(date.toISOString())}`;
      },
    },
    {
      key: "address",
      header: "Location",
      cell: (inspection) =>
        [inspection.address.area, inspection.address.city]
          .filter(Boolean)
          .join(", ") || "—",
    },
    {
      key: "status",
      header: "Status",
      cell: (inspection) => (
        <StatusBadge status={inspection.status} map={inspectionStatus} />
      ),
      mobile: "badge",
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (inspection) => (
        <Button
          size="sm"
          variant="secondary"
          href={`/staff/inspections/${inspection.id}`}
        >
          {inspection.status === "completed" ? "View report" : "Open"}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : "Unable to load inspections."
        }
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Inspections"
        description="Site visits assigned to you."
      />

      <Card>
        <div className="px-4 pt-1 sm:px-5">
          <Tabs
            tabs={tabs.map((item) => ({
              ...item,
              count:
                item.value === "all"
                  ? inspections.length
                  : inspections.filter(
                      (inspection) => inspection.status === item.value,
                    ).length,
            }))}
            value={tab}
            onChange={setTab}
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          error={null}
          onRetry={() => refetch()}
          href={(inspection) => `/staff/inspections/${inspection.id}`}
          empty={{
            title: "No inspections",
            description: "Inspections assigned to you will appear here.",
          }}
        />
      </Card>
    </>
  );
}
