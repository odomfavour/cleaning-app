"use client";

import { useMemo, useState } from "react";

import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { Tabs } from "@/components/kit/Tabs";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { StatusBadge } from "@/components/kit/Badge";
import { useAdminInspections } from "@/lib/hooks/queries/use-admin-inspections";

import { inspectionStatus } from "@/lib/status";
import { fmtDate, fmtTime } from "@/lib/utils";
import { InspectionStatus } from "@/lib/types";
import { AdminInspection } from "@/lib/api/services/admin-inspections.service";

type Tab = "all" | InspectionStatus;

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function InspectionsPage() {
  const {
    data: inspections = [],
    isLoading,
    error,
    refetch,
  } = useAdminInspections();

  const [tab, setTab] = useState<Tab>("all");

  const rows = useMemo(() => {
    return inspections
      .filter((inspection) => tab === "all" || inspection.status === tab)
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      );
  }, [inspections, tab]);

  const columns: Column<AdminInspection>[] = [
    {
      key: "id",
      header: "Inspection",
      cell: (inspection) => (
        <span className="font-mono text-xs" title={inspection.id}>
          {inspection.id.slice(0, 8).toUpperCase()}…
        </span>
      ),
      mobile: "title",
    },
    {
      key: "request",
      header: "Request",
      cell: (inspection) => inspection.requestReference,
    },
    {
      key: "customer",
      header: "Customer",
      cell: (inspection) => inspection.customer.name,
    },
    {
      key: "who",
      header: "Inspector",
      cell: (inspection) => inspection.inspector?.name ?? "—",
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
      key: "status",
      header: "Status",
      cell: (inspection) => (
        <StatusBadge status={inspection.status} map={inspectionStatus} />
      ),
      mobile: "badge",
    },
    {
      key: "action",
      header: "Report",
      align: "right",
      cell: (inspection) => (
        <Button
          size="sm"
          variant="secondary"
          href={`/admin/inspections/${inspection.id}`}
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
        description="Site visits that help us quote larger or complex jobs accurately."
      />

      <Card>
        <div className="px-4 pt-1 sm:px-5">
          <Tabs
            tabs={tabs.map((tab) => ({
              ...tab,
              count:
                tab.value === "all"
                  ? inspections.length
                  : inspections.filter(
                      (inspection) => inspection.status === tab.value,
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
          href={(inspection) => `/admin/inspections/${inspection.id}`}
          empty={{
            title: "No inspections",
            description:
              "Open a cleaning request that needs a site visit to schedule an inspection.",
          }}
        />
      </Card>
    </>
  );
}
