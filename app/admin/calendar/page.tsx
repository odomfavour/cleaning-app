"use client";
import { Button as UiButton } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminData } from "@/lib/useAdminData";
import { PageHeader, PageSkeleton, ErrorState, EmptyState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card } from "@/components/kit/Card";
import { SegmentedControl } from "@/components/kit/Tabs";
import { TODAY } from "@/lib/mock/seed";
import { cn, fmtTime } from "@/lib/utils";

type View = "day" | "week" | "month";
interface Ev { id: string; date: string; time: string; title: string; sub: string; href: string; kind: "job" | "inspection"; live?: boolean }

const D = (s: string) => new Date(s + "T00:00:00Z");
const iso = (d: Date) => d.toISOString().slice(0, 10);
const add = (s: string, n: number) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const monday = (s: string) => add(s, -((D(s).getUTCDay() + 6) % 7));
const fmt = (s: string, o: Intl.DateTimeFormatOptions) => D(s).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const { d, L, loading, error, reload } = useAdminData();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(TODAY);
  const [picked, setPicked] = useState(TODAY);

  const events: Ev[] = !d ? [] : [
    ...d.bookings.filter((b) => b.status !== "cancelled").map((b) => ({ id: b.id, date: b.date, time: b.time, title: b.title, sub: L.customer(b.customerId)?.name ?? "", href: `/admin/bookings/${b.id}`, kind: "job" as const, live: ["en_route", "arrived", "in_progress"].includes(b.status) })),
    ...d.inspections.filter((i) => i.status === "scheduled").map((i) => ({ id: i.id, date: i.date, time: i.time, title: "Inspection", sub: L.customer(L.request(i.requestId)?.customerId)?.name ?? "", href: `/admin/inspections/${i.id}`, kind: "inspection" as const })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  if (loading && !d) return <PageSkeleton />;
  if (error || !d) return <ErrorState message={error ?? undefined} onRetry={reload} />;

  const on = (day: string) => events.filter((e) => e.date === day);
  const step = (dir: number) => setCursor(view === "day" ? add(cursor, dir) : view === "week" ? add(cursor, dir * 7) : (() => { const x = D(cursor); x.setUTCMonth(x.getUTCMonth() + dir, 1); return iso(x); })());
  const title = view === "month" ? fmt(cursor, { month: "long", year: "numeric" }) : view === "week" ? `${fmt(monday(cursor), { day: "numeric", month: "short" })} – ${fmt(add(monday(cursor), 6), { day: "numeric", month: "short", year: "numeric" })}` : fmt(cursor, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const chip = (e: Ev, big = false) => (
    <Link key={e.id} href={e.href} className={cn("block rounded-md border-l-[3px] px-2 py-1 text-xs leading-tight hover:brightness-95", e.kind === "inspection" ? "border-violet-500 bg-violet-50 text-violet-900" : e.live ? "border-amber-500 bg-amber-50 text-amber-900" : "border-primary bg-brand-50 text-primary", big && "p-2.5 text-sm")}>
      <span className="font-semibold">{fmtTime(e.time)}</span> {e.title}<span className={cn("block truncate opacity-75", !big && "hidden xl:block")}>{e.sub}</span>
    </Link>);

  const gridStart = monday(D(cursor.slice(0, 8) + "01").toISOString().slice(0, 10));
  const days = Array.from({ length: 42 }, (_, i) => add(gridStart, i));
  const month = cursor.slice(0, 7);
  const agenda = (day: string) => (
    <Card className="mt-4"><div className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">{fmt(day, { weekday: "long", day: "numeric", month: "long" })}{day === TODAY && " · Today"}</div>
      {on(day).length ? <div className="space-y-2 p-4">{on(day).map((e) => chip(e, true))}</div> : <EmptyState title="Nothing scheduled" description="No jobs or inspections on this day." />}</Card>);

  return (
    <>
      <PageHeader title="Calendar" description="Cleaning jobs and inspections at a glance." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1"><Button variant="secondary" size="sm" onClick={() => step(-1)} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></Button><Button variant="secondary" size="sm" onClick={() => { setCursor(TODAY); setPicked(TODAY); }}>Today</Button><Button variant="secondary" size="sm" onClick={() => step(1)} aria-label="Next"><ChevronRight className="h-4 w-4" /></Button></div>
        <h2 className="text-lg font-semibold text-primary" aria-live="polite">{title}</h2>
        <div className="ml-auto"><SegmentedControl value={view} onChange={setView} options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]} /></div>
      </div>

      {view === "month" && <>
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-medium text-muted-foreground">{dow.map((x) => <div key={x} className="py-2">{x}</div>)}</div>
          <div className="grid grid-cols-7">
            {days.map((day) => { const ev = on(day); const inMonth = day.startsWith(month); return (
              <UiButton key={day} variant="ghost" onClick={() => setPicked(day)} aria-label={`${fmt(day, { day: "numeric", month: "long" })}, ${ev.length} events`} className={cn("h-auto min-h-[56px] flex-col items-stretch justify-start gap-0 rounded-none border-b border-r p-1.5 text-left font-normal whitespace-normal hover:bg-muted/60 sm:min-h-[104px]", !inMonth && "bg-muted/40/60 text-muted-foreground/70", picked === day && "bg-blue-50/70")}>
                <span className={cn("inline-flex size-6 items-center justify-center self-start rounded-full text-xs font-medium", day === TODAY && "bg-primary text-white")}>{D(day).getUTCDate()}</span>
                <span className="mt-1 hidden space-y-1 sm:block">{ev.slice(0, 2).map((e) => <span key={e.id} className={cn("block truncate rounded px-1.5 py-0.5 text-[11px]", e.kind === "inspection" ? "bg-violet-100 text-violet-900" : "bg-brand-100 text-primary")}>{fmtTime(e.time)} {e.title}</span>)}{ev.length > 2 && <span className="block px-1 text-[11px] text-muted-foreground">+{ev.length - 2} more</span>}</span>
                <span className="mt-1 flex gap-0.5 sm:hidden">{ev.slice(0, 3).map((e) => <span key={e.id} className={cn("h-1.5 w-1.5 rounded-full", e.kind === "inspection" ? "bg-violet-500" : "bg-primary")} />)}</span>
              </UiButton>); })}
          </div>
        </Card>
        {agenda(picked)}
      </>}

      {view === "week" && (
        <div className="grid gap-3 lg:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => add(monday(cursor), i)).map((day) => (
            <Card key={day} className={cn("overflow-hidden", day === TODAY && "ring-2 ring-primary/30")}>
              <div className={cn("flex items-baseline gap-2 border-b border-border px-3 py-2 lg:block", day === TODAY && "bg-brand-50")}><p className="text-xs font-medium text-muted-foreground">{fmt(day, { weekday: "short" })}</p><p className="text-sm font-semibold text-foreground">{fmt(day, { day: "numeric", month: "short" })}</p></div>
              <div className="min-h-[56px] space-y-1.5 p-2 lg:min-h-[240px]">{on(day).map((e) => chip(e))}{!on(day).length && <p className="px-1 py-1 text-xs text-muted-foreground/70">Free</p>}</div>
            </Card>))}
        </div>
      )}

      {view === "day" && agenda(cursor)}
      <p className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary" />Cleaning job</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-amber-500" />In progress</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-violet-500" />Inspection</span></p>
    </>
  );
}
