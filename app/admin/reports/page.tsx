"use client";
import { useState } from "react";
import { useAdminData } from "@/lib/useAdminData";
import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { BarChart, HBars, LineChart, StackedBar } from "@/components/kit/Charts";
import { SegmentedControl } from "@/components/kit/Tabs";
import { bookingStatus } from "@/lib/status";
import { getApiErrorMessage } from "@/lib/api/errors";
import { naira } from "@/lib/utils";

export default function ReportsPage() {
  const { d, loading, error, reload } = useAdminData();
  const [range, setRange] = useState<"6m" | "3m">("6m");
  if (loading && !d) return <PageSkeleton />;
  if (error || !d) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />;

  const monthCount = range === "3m" ? 3 : 6;
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  const months = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(currentMonth);
    date.setMonth(date.getMonth() - monthCount + index + 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-NG", { month: "short" }),
    };
  });
  const series = <T,>(items: T[], dateOf: (item: T) => string | undefined, valueOf: (item: T) => number = () => 1) => {
    const values = new Map(months.map((month) => [month.key, 0]));
    const monthKey = (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      return `${date.getFullYear()}-${date.getMonth()}`;
    };
    for (const item of items) {
      const key = monthKey(dateOf(item));
      if (key && values.has(key)) values.set(key, (values.get(key) ?? 0) + valueOf(item));
    }
    return months.map((month) => ({ label: month.label, value: values.get(month.key) ?? 0 }));
  };
  const requestsOverTime = series(d.requests, (request) => request.submittedAt);
  const completedOverTime = series(
    d.bookings.filter((booking) => booking.status === "completed"),
    (booking) => booking.completedAt ?? booking.date,
  );
  const monthlyRevenue = series(
    d.payments.filter((payment) => payment.status === "paid"),
    (payment) => payment.date,
    (payment) => payment.amount,
  );
  const customerActivity = months.map((month) => {
    const ids = new Set(
      d.requests
        .filter((request) => {
          const date = new Date(request.submittedAt);
          return `${date.getFullYear()}-${date.getMonth()}` === month.key;
        })
        .map((request) => request.customerId),
    );
    return { label: month.label, value: ids.size };
  });
  const serviceCounts = new Map<string, number>();
  for (const request of d.requests) {
    for (const service of request.services) {
      serviceCounts.set(service, (serviceCounts.get(service) ?? 0) + 1);
    }
  }
  const topServices = [...serviceCounts]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const statusKeys = Object.keys(bookingStatus);
  const breakdown = statusKeys.map((status) => ({
    label: bookingStatus[status as keyof typeof bookingStatus].label,
    value: d.bookings.filter((booking) => booking.status === status).length,
  }));
  return (
    <>
      <PageHeader title="Reports" description="How the business is doing." actions={<SegmentedControl value={range} onChange={setRange} options={[{ value: "3m", label: "3 months" }, { value: "6m", label: "6 months" }]} />} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader title="Requests over time" /><CardBody className="pt-6"><LineChart data={requestsOverTime} /></CardBody></Card>
        <Card><CardHeader title="Completed jobs" /><CardBody className="pt-8"><BarChart data={completedOverTime} /></CardBody></Card>
        <Card><CardHeader title="Revenue" description="Successful payments" /><CardBody className="pt-8"><BarChart data={monthlyRevenue} format={naira} color="bg-emerald-600" /></CardBody></Card>
        <Card><CardHeader title="Most requested services" /><CardBody>{topServices.length ? <HBars data={topServices} /> : <p className="text-sm text-muted-foreground">No service requests yet.</p>}</CardBody></Card>
        <Card><CardHeader title="Booking status" description="Live from current bookings" /><CardBody><StackedBar data={breakdown} /></CardBody></Card>
        <Card><CardHeader title="Active customers" description="Customers with a request each month" /><CardBody className="pt-6"><LineChart data={customerActivity} /></CardBody></Card>
      </div>
    </>
  );
}
