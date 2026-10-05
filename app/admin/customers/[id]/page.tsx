"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAdminData } from "@/lib/useAdminData";
import {
  PageHeader,
  PageSkeleton,
  ErrorState,
  EmptyState,
} from "@/components/kit/Page";
import { Card, CardBody, DetailList } from "@/components/kit/Card";
import { Badge, StatusBadge } from "@/components/kit/Badge";
import { Avatar, Stars } from "@/components/kit/Misc";
import { Tabs } from "@/components/kit/Tabs";
import {
  bookingStatus,
  generic,
  paymentStatus,
  quoteStatus,
  requestStatus,
} from "@/lib/status";
import { quoteTotals } from "@/lib/quote";
import { fmtDate, naira } from "@/lib/utils";

type Tab =
  | "profile"
  | "requests"
  | "quotes"
  | "bookings"
  | "payments"
  | "reviews";

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { d, L, loading, error, reload } = useAdminData();
  const [tab, setTab] = useState<Tab>("profile");
  if (loading && !d) return <PageSkeleton />;
  const c = L.customer(id);
  if (error || !d || !c)
    return (
      <ErrorState message={error ?? "Customer not found"} onRetry={reload} />
    );
  const requests = d.requests.filter((r) => r.customerId === id),
    quotes = d.quotes.filter((q) => q.customer?.id === id),
    bookings = d.bookings.filter((b) => b.customerId === id),
    payments = d.payments.filter((p) => p.customerId === id),
    reviews = d.reviews.filter((r) => r.customerId === id);
  const Row = ({
    href,
    a,
    b,
    badge,
  }: {
    href?: string;
    a: string;
    b: string;
    badge: React.ReactNode;
  }) => {
    const inner = (
      <>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{a}</p>
          <p className="truncate text-xs text-muted-foreground">{b}</p>
        </div>
        {badge}
      </>
    );
    return (
      <li>
        {href ? (
          <Link
            href={href}
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40"
          >
            {inner}
          </Link>
        ) : (
          <div className="flex items-center gap-3 px-5 py-3.5">{inner}</div>
        )}
      </li>
    );
  };
  const list = (items: React.ReactNode[], empty: string) => (
    <Card>
      {items.length ? (
        <ul className="divide-y divide-border">{items}</ul>
      ) : (
        <EmptyState title={empty} />
      )}
    </Card>
  );
  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={c.name}
        meta={
          <span className="flex gap-2">
            <StatusBadge status={c.status} map={generic} />
            {!c.hasAccount && <Badge tone="purple">Guest: no account</Badge>}
          </span>
        }
        description={`Customer since ${fmtDate(c.joinedAt, { month: "long", year: "numeric" })}`}
      />
      <Card className="mb-6">
        <div className="px-4 sm:px-5">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "profile", label: "Profile" },
              { value: "requests", label: "Requests", count: requests.length },
              { value: "quotes", label: "Quotes", count: quotes.length },
              { value: "bookings", label: "Bookings", count: bookings.length },
              { value: "payments", label: "Payments", count: payments.length },
              { value: "reviews", label: "Reviews", count: reviews.length },
            ]}
          />
        </div>
      </Card>
      {tab === "profile" && (
        <Card>
          <CardBody className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={c.name} size="lg" />
              <div>
                <p className="text-lg font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.email}</p>
              </div>
            </div>
            <DetailList
              items={[
                { label: "Phone", value: c.phone },
                { label: "Email", value: c.email },
                {
                  label: "Saved addresses",
                  value: c.addresses.length
                    ? c.addresses
                        .map((a) => `${a.label}: ${a.address}`)
                        .join("; ")
                    : "None",
                },
                {
                  label: "Total spent",
                  value: naira(
                    payments
                      .filter((p) => p.status === "paid")
                      .reduce((s, p) => s + p.amount, 0),
                  ),
                },
              ]}
            />
          </CardBody>
        </Card>
      )}
      {tab === "requests" &&
        list(
          requests.map((r) => (
            <Row
              key={r.id}
              href={`/admin/requests/${r.id}`}
              a={`${r.id}: ${r.services.join(", ")}`}
              b={fmtDate(r.submittedAt)}
              badge={<StatusBadge status={r.status} map={requestStatus} />}
            />
          )),
          "No requests",
        )}
      {tab === "quotes" &&
        list(
          quotes.map((q) => (
            <Row
              key={q.id}
              a={`${q.id} · ${naira(quoteTotals(q).total)}`}
              b={`Valid until ${fmtDate(q.validUntil)}`}
              badge={<StatusBadge status={q.status} map={quoteStatus} />}
            />
          )),
          "No quotes",
        )}
      {tab === "bookings" &&
        list(
          bookings.map((b) => (
            <Row
              key={b.id}
              href={`/admin/bookings/${b.id}`}
              a={`${b.id}: ${b.title}`}
              b={fmtDate(b.date)}
              badge={<StatusBadge status={b.status} map={bookingStatus} />}
            />
          )),
          "No bookings",
        )}
      {tab === "payments" &&
        list(
          payments.map((p) => (
            <Row
              key={p.id}
              a={`${p.reference} · ${naira(p.amount)}`}
              b={fmtDate(p.date)}
              badge={<StatusBadge status={p.status} map={paymentStatus} />}
            />
          )),
          "No payments",
        )}
      {tab === "reviews" &&
        list(
          reviews.map((r) => (
            <li key={r.id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <Stars value={r.rating} size={16} />
                <span className="text-xs text-muted-foreground">
                  {fmtDate(r.date)}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-foreground/80">{r.comment}</p>
            </li>
          )),
          "No reviews",
        )}
    </>
  );
}
