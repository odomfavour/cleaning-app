"use client";

import { useState } from "react";

import { PageHeader } from "@/components/kit/Page";
import { SearchInput } from "@/components/kit/Field";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { Tabs } from "@/components/kit/Tabs";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { StatusBadge } from "@/components/kit/Badge";

import { requestStatus } from "@/lib/status";

import { fmtDate } from "@/lib/utils";
import { useAdminCleaningRequests } from "@/lib/hooks/queries/use-admin-cleaning-requests";

type Tab =
  | "all"
  | "submitted"
  | "reviewing"
  | "inspection_required"
  | "quoted"
  | "accepted"
  | "declined";

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "New" },
  { value: "reviewing", label: "Under review" },
  { value: "inspection_required", label: "Inspection required" },
  { value: "quoted", label: "Quote sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

export default function AdminRequestsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");

  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = useAdminCleaningRequests();

  const matchesTab = (requestStatusValue: string) => {
    return tab === "all" || requestStatusValue === tab;
  };

  const query = q.trim().toLowerCase();

  const rows = requests.filter((request) => {
    if (!matchesTab(request.status)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      request.reference,
      request.customer.name,
      request.customer.email,
      request.customer.phone,
      request.services.join(" "),
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query));
  });

  const columns: Column<(typeof requests)[number]>[] = [
    {
      key: "reference",
      header: "Request",
      cell: (request) => request.reference,
      mobile: "title",
    },

    {
      key: "customer",
      header: "Customer",
      cell: (request) => request.customer.name,
    },

    {
      key: "service",
      header: "Service",
      cell: (request) => (
        <span className="line-clamp-1 max-w-[220px]">
          {request.services.join(", ")}
        </span>
      ),
    },

    {
      key: "environment",
      header: "Environment",
      cell: (request) => request.environment || "—",
    },

    {
      key: "submitted",
      header: "Submitted",
      cell: (request) => fmtDate(request.submittedAt),
    },

    {
      key: "status",
      header: "Status",
      cell: (request) => (
        <StatusBadge status={request.status} map={requestStatus} />
      ),
      mobile: "badge",
    },

    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (request) => (
        <Button
          size="sm"
          variant={request.status === "submitted" ? "primary" : "secondary"}
          href={`/admin/requests/${request.id}`}
        >
          {request.status === "submitted" ? "Review" : "Open"}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Cleaning requests"
        description="Review incoming requests and move them toward a quotation."
      />

      <Card>
        <div className="flex flex-col gap-3 px-4 pt-1 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <Tabs
            className="flex-1 border-b-0 lg:border-b"
            tabs={tabs.map((item) => ({
              ...item,
              count:
                item.value === "all"
                  ? requests.length
                  : requests.filter((request) => request.status === item.value)
                      .length,
            }))}
            value={tab}
            onChange={setTab}
          />

          <SearchInput
            label="Search requests"
            className="mb-3 lg:mb-0 lg:w-64"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search customer or ID"
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          error={
            error instanceof Error
              ? error.message
              : error
                ? "Unable to load requests."
                : undefined
          }
          onRetry={() => refetch()}
          href={(request) => `/admin/requests/${request.id}`}
          empty={{
            title: "No requests match",
            description: q
              ? "Try a different search."
              : "Requests with this status will appear here.",
          }}
        />
      </Card>
    </>
  );
}
