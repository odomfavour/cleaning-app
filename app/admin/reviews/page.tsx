"use client";
import { useAdminData } from "@/lib/useAdminData";
import { PageHeader, PageSkeleton, ErrorState, EmptyState } from "@/components/kit/Page";
import { Card, CardBody } from "@/components/kit/Card";
import { Avatar, Stars } from "@/components/kit/Misc";
import { Badge } from "@/components/kit/Badge";
import { PhotoGrid } from "@/components/kit/FileUploader";
import { fmtDate } from "@/lib/utils";

export default function ReviewsPage() {
  const { d, L, loading, error, reload } = useAdminData();
  if (loading && !d) return <PageSkeleton />;
  if (error || !d) return <ErrorState message={error ?? undefined} onRetry={reload} />;
  const avg = d.reviews.length ? d.reviews.reduce((s, r) => s + r.rating, 0) / d.reviews.length : 0;
  return (
    <>
      <PageHeader title="Reviews" description="What customers say after a job is completed." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit"><CardBody>
          <p className="text-4xl font-bold text-primary">{avg.toFixed(1)}</p><Stars value={avg} /><p className="mt-1 text-sm text-muted-foreground">{d.reviews.length} reviews</p>
          <ul className="mt-5 space-y-2">{[5, 4, 3, 2, 1].map((n) => { const c = d.reviews.filter((r) => r.rating === n).length; return <li key={n} className="flex items-center gap-3 text-sm"><span className="w-3 text-muted-foreground">{n}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-amber-400" style={{ width: `${d.reviews.length ? (c / d.reviews.length) * 100 : 0}%` }} /></div><span className="w-4 text-right tabular-nums text-muted-foreground">{c}</span></li>; })}</ul>
        </CardBody></Card>
        <div className="space-y-4 lg:col-span-2">
          {d.reviews.length === 0 ? <Card><EmptyState title="No reviews yet" description="Reviews appear here after customers rate completed jobs." /></Card> : d.reviews.map((r) => { const c = L.customer(r.customerId); return (
            <Card key={r.id}><CardBody>
              <div className="flex items-start gap-3"><Avatar name={c?.name ?? "?"} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-foreground">{c?.name}</p><span className="text-xs text-muted-foreground">{fmtDate(r.date)}</span></div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2"><Stars value={r.rating} size={15} /><Badge>{r.service}</Badge><a href={`/admin/bookings/${r.bookingId}`} className="text-xs text-blue-700 hover:underline">{r.bookingId}</a></div></div></div>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground">{r.comment}</p>{r.photos.length > 0 && <div className="mt-3"><PhotoGrid photos={r.photos} /></div>}
            </CardBody></Card>); })}
        </div>
      </div>
    </>
  );
}
