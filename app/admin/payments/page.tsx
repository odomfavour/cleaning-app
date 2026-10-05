"use client";
import { useMemo, useState } from "react";
import { useAdminData } from "@/lib/useAdminData";
import { PageHeader, StatCard } from "@/components/kit/Page";
import { Card } from "@/components/kit/Card";
import { Tabs } from "@/components/kit/Tabs";
import { DataTable, type Column } from "@/components/kit/DataTable";
import { StatusBadge } from "@/components/kit/Badge";
import { paymentStatus } from "@/lib/status";
import type { Payment, PaymentStatus } from "@/lib/types";
import { Banknote, Clock, RotateCcw, XCircle } from "lucide-react";
import { fmtDate, naira } from "@/lib/utils";

type Tab = "all" | PaymentStatus;
const method = { card: "Card", bank_transfer: "Bank transfer", ussd: "USSD" };

export default function PaymentsPage() {
  const { d, L, loading, error, reload } = useAdminData();
  const [tab, setTab] = useState<Tab>("all");
  const rows = useMemo(() => d?.payments.filter((p) => tab === "all" || p.status === tab), [d, tab]);
  const sum = (s: PaymentStatus) => d?.payments.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0) ?? 0;
  const columns: Column<Payment>[] = [
    { key: "ref", header: "Reference", cell: (p) => p.reference, mobile: "title" },
    { key: "cust", header: "Customer", cell: (p) => L.customer(p.customerId)?.name },
    { key: "bk", header: "Booking", cell: (p) => p.bookingId ?? "—" },
    { key: "amt", header: "Amount", cell: (p) => <span className="font-medium tabular-nums">{naira(p.amount)}</span> },
    { key: "m", header: "Method", cell: (p) => method[p.method] },
    { key: "date", header: "Date", cell: (p) => fmtDate(p.date) },
    { key: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} map={paymentStatus} />, mobile: "badge" },
  ];
  return (
    <>
      <PageHeader title="Payments" description="Money received for accepted quotations." />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Paid" value={naira(sum("paid"))} icon={Banknote} tone="green" /><StatCard label="Pending" value={naira(sum("pending"))} icon={Clock} tone="amber" /><StatCard label="Failed" value={naira(sum("failed"))} icon={XCircle} tone="violet" /><StatCard label="Refunded" value={naira(sum("refunded"))} icon={RotateCcw} tone="blue" /></div>
      <Card>
        <div className="px-4 pt-1 sm:px-5"><Tabs value={tab} onChange={setTab} tabs={[{ value: "all" as Tab, label: "All" }, ...(["pending", "paid", "failed", "refunded"] as PaymentStatus[]).map((s) => ({ value: s as Tab, label: paymentStatus[s].label }))].map((t) => ({ ...t, count: d?.payments.filter((p) => t.value === "all" || p.status === t.value).length }))} /></div>
        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={reload} empty={{ title: "No payments here" }} />
      </Card>
    </>
  );
}
