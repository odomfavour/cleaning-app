"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AccessGate } from "@/components/shared/AccessGate";
import { useApi } from "@/lib/hooks";
import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";
import { StatusBadge } from "@/components/kit/Badge";
import { Timeline } from "@/components/kit/Timeline";
import { ConfirmDialog } from "@/components/kit/Dialog";
import { RequestSummary } from "@/components/shared/RequestSummary";
import { requestStatus } from "@/lib/status";
import { requestTimeline } from "@/lib/timeline";
import { fmtDate } from "@/lib/utils";

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useApi(async () => {
    const r = await api.requests.getById(id);
    const [me, quotes, bookings, inspections] = await Promise.all([api.customers.me(), api.quotes.getAll(), api.bookings.getAll(), api.inspections.getAll()]);
    return { r, me, quote: quotes.find((q) => q.id === r.quoteId), booking: bookings.find((b) => b.id === r.bookingId), inspection: inspections.find((i) => i.id === r.inspectionId) };
  }, [id]);
  if (loading && !data) return <PageSkeleton />;
  if (error || !data) return <ErrorState message={error ?? undefined} onRetry={reload} />;
  const { r, me, quote, booking, inspection } = data;
  if (!api.session.canAccess(r.customerId)) return <AccessGate customerId={r.customerId} reference={r.id} onGranted={reload} title="Verify to continue" />;
  const canCancel = ["new", "under_review", "inspection_required"].includes(r.status);

  const cancel = async () => { setBusy(true); await api.requests.cancel(r.id); setBusy(false); setCancelOpen(false); toast.success("Request cancelled"); reload(); };

  return (
    <>
      <PageHeader back={{ href: "/dashboard/requests", label: "My requests" }} title={r.id} meta={<StatusBadge status={r.status} map={requestStatus} />}
        description={`${r.services.join(", ")} · Submitted ${fmtDate(r.submittedAt)}`}
        actions={<>
          {r.status === "quote_sent" && r.quoteId && <Button href={`/dashboard/quotes/${r.quoteId}`}>Review quote</Button>}
          {r.status === "accepted" && !booking && quote && <Button href={`/dashboard/payment/${quote.id}`}>Continue to payment</Button>}
          {booking && <Button href={`/dashboard/bookings/${booking.id}`} variant="secondary">View booking</Button>}
          {canCancel && <Button variant="ghost" onClick={() => setCancelOpen(true)} className="text-red-700 hover:bg-red-50">Cancel request</Button>}
        </>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2"><RequestSummary r={r} /></div>
        <div className="space-y-5">
          <Card><CardHeader title="Progress" /><CardBody><Timeline items={requestTimeline(r, { quote, inspection, booking })} /></CardBody></Card>
          <Card><CardHeader title="Your details" /><CardBody><DetailList cols={1} items={[{ label: "Name", value: me.name }, { label: "Phone", value: me.phone }, { label: "Email", value: me.email }]} /></CardBody></Card>
          {r.adminNote && <Card className="border-amber-200 bg-amber-50/60"><CardBody><p className="text-xs font-medium text-amber-800">Note from our team</p><p className="mt-1 text-sm text-foreground">{r.adminNote}</p></CardBody></Card>}
        </div>
      </div>
      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={cancel} loading={busy} tone="danger" title="Cancel this request?" description={`${r.id} will be closed and our team will stop working on it. You can always submit a new request later.`} confirmLabel="Cancel request" />
    </>
  );
}
