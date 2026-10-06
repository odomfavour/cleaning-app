"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { Tabs } from "@/components/kit/Tabs";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { StatusBadge } from "@/components/kit/Badge";
import { environmentLabel, requestStatus } from "@/lib/status";
import type { Environment } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getCustomerRequests,
  type CustomerRequestSummary,
} from "@/lib/api/services/cleaning-request.service";

type Tab =
  | "all"
  | "new"
  | "under_review"
  | "quote_sent"
  | "accepted"
  | "completed"
  | "cancelled";
const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "quote_sent", label: "Quote sent" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
// "Under review" for customers also covers inspection; "Cancelled" also covers declined/rejected.
const match = (tab: Tab, request: CustomerRequestSummary) =>
  tab === "all" ||
  (tab === "under_review"
    ? ["under_review", "inspection_required"].includes(request.status)
    : tab === "cancelled"
      ? ["cancelled", "declined", "rejected"].includes(request.status)
      : request.status === tab);

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(kobo / 100);
}

export default function MyRequestsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const query = useQuery({
    queryKey: ["customer-requests"],
    queryFn: getCustomerRequests,
  });
  const requests = query.data ?? [];
  const rows = requests.filter((request) => match(tab, request));
  const error = query.error ? getApiErrorMessage(query.error) : undefined;

  const columns: Column<CustomerRequestSummary>[] = [
    {
      key: "id",
      header: "Request",
      cell: (request) => request.reference,
      mobile: "title",
    },
    {
      key: "service",
      header: "Service",
      cell: (request) => (
        <span className="line-clamp-2">{request.services.join(", ")}</span>
      ),
    },
    {
      key: "env",
      header: "Environment",
      cell: (request) =>
        environmentLabel[request.environment as Environment] ??
        request.environment,
    },
    {
      key: "date",
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
      key: "quote",
      header: "Quote",
      align: "right",
      cell: (request) =>
        request.quote ? (
          <span className="font-medium tabular-nums">
            {formatNaira(request.quote.totalKobo)}
          </span>
        ) : (
          <span className="text-muted-foreground/70">—</span>
        ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (request) =>
        request.quote && ["sent", "accepted"].includes(request.quote.status) ? (
          <Button size="sm" href={`/dashboard/quotes/${request.quote.id}`}>
            {request.quote.status === "sent" ? "Review quote" : "View quote"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            href={`/dashboard/requests/${request.reference}`}
          >
            View
          </Button>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My requests"
        description="Every cleaning request you've made, and where each one stands."
        actions={
          <Button href="/dashboard/request-cleaning">
            <Plus className="h-4 w-4" />
            New request
          </Button>
        }
      />
      <Card>
        <div className="px-4 pt-1 sm:px-5">
          <Tabs
            tabs={tabs.map((item) => ({
              ...item,
              count: requests.filter((request) => match(item.value, request))
                .length,
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
          href={(request) => `/dashboard/requests/${request.reference}`}
          empty={{
            title: tab === "all" ? "No requests yet" : "Nothing in this tab",
            description:
              tab === "all"
                ? "Tell us what needs cleaning and we'll send you a quote."
                : "Requests with this status will show up here.",
            action:
              tab === "all" ? (
                <Button href="/dashboard/request-cleaning">
                  Request a cleaning
                </Button>
              ) : undefined,
          }}
        />
      </Card>
    </>
  );
}
