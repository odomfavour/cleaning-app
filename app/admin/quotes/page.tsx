"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { Dialog } from "@/components/kit/Dialog";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { StatusBadge } from "@/components/kit/Badge";
import { QuoteDocument } from "@/components/shared/QuoteCard";

import { quoteStatus } from "@/lib/status";
import { fmtDate, naira } from "@/lib/utils";
import { useAdminQuotes } from "@/lib/hooks/queries/use-admin-queries";
import { AdminQuote } from "@/lib/api/services/admin-quote.service";

export default function AdminQuotesPage() {
  const { data: quotes, isLoading, error, refetch } = useAdminQuotes();

  const [view, setView] = useState<AdminQuote | null>(null);

  const columns: Column<AdminQuote>[] = [
    {
      key: "quote",
      header: "Quote",
      cell: (quote) => quote.quoteNumber,
      mobile: "title",
    },

    {
      key: "request",
      header: "Request",
      cell: (quote) => quote.request?.reference ?? "—",
    },

    {
      key: "customer",
      header: "Customer",
      cell: (quote) => quote.customer?.name ?? "—",
    },

    {
      key: "amount",
      header: "Total",
      cell: (quote) => (
        <span className="font-medium tabular-nums">
          {naira(quote.totalKobo / 100)}
        </span>
      ),
    },

    {
      key: "valid",
      header: "Valid until",
      cell: (quote) => (quote.expiresAt ? fmtDate(quote.expiresAt) : "—"),
    },

    {
      key: "status",
      header: "Status",
      cell: (quote) => <StatusBadge status={quote.status} map={quoteStatus} />,
      mobile: "badge",
    },

    {
      key: "action",
      header: "Action",
      align: "right",
      cell: (quote) => (
        <Button size="sm" variant="secondary" onClick={() => setView(quote)}>
          Preview
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Quotes"
        description="Quotations sent to customers and their responses."
        actions={
          <Button href="/admin/quotes/create">
            <Plus className="h-4 w-4" />
            Create quote
          </Button>
        }
      />

      <Card>
        <DataTable
          columns={columns}
          rows={quotes}
          loading={isLoading}
          error={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          empty={{
            title: "No quotes yet",
            action: <Button href="/admin/quotes/create">Create quote</Button>,
          }}
        />
      </Card>

      <Dialog
        open={!!view}
        onClose={() => setView(null)}
        title={view ? `Quote ${view.quoteNumber}` : ""}
        size="lg"
      >
        {view && view.customer && (
          <QuoteDocument
            quote={view}
            request={view.request}
            customer={view.customer}
          />
        )}
      </Dialog>
    </>
  );
}
