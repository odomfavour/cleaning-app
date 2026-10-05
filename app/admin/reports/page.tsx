"use client";
import { useState } from "react";
import { useAdminData } from "@/lib/useAdminData";
import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { BarChart, HBars, LineChart, StackedBar } from "@/components/kit/Charts";
import { SegmentedControl } from "@/components/kit/Tabs";
import { bookingStatus } from "@/lib/status";
import { completedOverTime, customerActivity, monthlyRevenue, requestsOverTime, topServices } from "@/lib/mock/reports";
import type { BookingStatus } from "@/lib/types";
import { naira } from "@/lib/utils";

export default function ReportsPage() {
  const { d, loading, error, reload } = useAdminData();
  const [range, setRange] = useState<"6m" | "3m">("6m");
  if (loading && !d) return <PageSkeleton />;
  if (error || !d) return <ErrorState message={error ?? undefined} onRetry={reload} />;
  const cut = range === "3m" ? 3 : 6;
  const last = <T,>(a: T[]) => a.slice(-cut);
  const breakdown = (Object.keys(bookingStatus) as BookingStatus[]).map((s) => ({ label: bookingStatus[s].label, value: d.bookings.filter((b) => b.status === s).length }));
  return (
    <>
      <PageHeader title="Reports" description="How the business is doing. Sample figures until the backend is connected." actions={<SegmentedControl value={range} onChange={setRange} options={[{ value: "3m", label: "3 months" }, { value: "6m", label: "6 months" }]} />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader title="Requests over time" /><CardBody className="pt-6"><LineChart data={last(requestsOverTime)} /></CardBody></Card>
        <Card><CardHeader title="Completed jobs" /><CardBody className="pt-8"><BarChart data={last(completedOverTime)} /></CardBody></Card>
        <Card><CardHeader title="Revenue" description="Paid quotations" /><CardBody className="pt-8"><BarChart data={last(monthlyRevenue)} format={naira} color="bg-emerald-600" /></CardBody></Card>
        <Card><CardHeader title="Most requested services" /><CardBody><HBars data={topServices} /></CardBody></Card>
        <Card><CardHeader title="Booking status" description="Live from current bookings" /><CardBody><StackedBar data={breakdown} /></CardBody></Card>
        <Card><CardHeader title="Active customers" description="Customers with a request each month" /><CardBody className="pt-6"><LineChart data={last(customerActivity)} /></CardBody></Card>
      </div>
    </>
  );
}
