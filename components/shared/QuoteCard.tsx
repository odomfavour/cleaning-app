import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, CalendarClock, FileText, MapPin } from "lucide-react";
import { Card } from "@/components/kit/Card";
import { Badge, StatusBadge } from "@/components/kit/Badge";
import { Avatar } from "@/components/kit/Misc";
import { Money } from "@/components/kit/Misc";
import { Button } from "@/components/kit/Button";
import { bookingStatus, quoteStatus } from "@/lib/status";
import type {
  Booking,
  CleaningRequest,
  Quote,
  QuoteItem,
  QuoteStatus,
  Staff,
} from "@/lib/types";
import { fmtDate, fmtLong, fmtTime, naira } from "@/lib/utils";
import { org } from "@/lib/config";
import { Logo } from "@/components/kit/Misc";

export function QuoteCard({
  quote,
  request,
}: {
  quote: Quote;
  request?: CleaningRequest;
}) {
  return (
    <Card className="flex flex-col gap-4 border-amber-200 bg-amber-50/60 p-5 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 ring-1 ring-amber-200">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">
          Your quote {quote.id} is ready
        </p>
        <p className="text-sm text-foreground/80">
          {request?.requestedServices
            ?.map((service) => service.name)
            .join(", ")}{" "}
          · <strong>{naira(quote.totalKobo ? quote.totalKobo / 100 : 100)}</strong> · valid until{" "}
          {fmtDate(quote.updatedAt)}
        </p>
      </div>
      <Button href={`/dashboard/quotes/${quote.id}`}>
        Review quote
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}

export function BookingCard({
  booking,
  staff,
  href,
  compact,
}: {
  booking: Booking;
  staff?: Staff[];
  href: string;
  compact?: boolean;
}) {
  const team = (staff ?? []).filter((s) => booking.staffIds.includes(s.id));
  return (
    <Link href={href} className="group block rounded-xl">
      <Card className="p-5 transition-colors group-hover:border-blue-300">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{booking.id}</p>
            <h3 className="mt-0.5 text-lg font-semibold text-primary">
              {booking.title}
            </h3>
          </div>
          <StatusBadge status={booking.status} map={bookingStatus} />
        </div>
        <div className="mt-4 space-y-2 text-sm text-foreground/80">
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            {fmtLong(booking.date)} at {fmtTime(booking.time)}
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
            {booking.location}
          </p>
        </div>
        {!compact && (
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            {team.length ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {team.map((s) => (
                    <Avatar
                      key={s.id}
                      name={s.name}
                      size="sm"
                      className="ring-2 ring-background"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {team.map((s) => s.name.split(" ")[0]).join(", ")}
                </span>
              </div>
            ) : (
              <Badge tone="neutral">Team to be assigned</Badge>
            )}
            <span className="flex items-center gap-1 text-sm font-medium text-blue-700 group-hover:gap-2">
              Details
              <ArrowRight className="h-4 w-4 transition-all" />
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}

export type QuoteDocumentProps = {
  quote: {
    quoteNumber: string;
    status: QuoteStatus;
    createdAt: string;
    expiresAt?: string;
    subtotalKobo: number;
    discountKobo: number;
    taxRate: number;
    taxKobo: number;
    totalKobo: number;
    items: QuoteItem[];
    terms: string;
  };
  request?: {
    id?: string;
    reference?: string;
    requestedServices?: { name: string }[];
    location?: { address: string; city?: string };
    preferred?: { date?: string; time?: string };
  } | null;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  } | null;
};

/** The quotation document itself. Used by the customer quote page and the admin preview. */
export function QuoteDocument({
  quote,
  request,
  customer,
}: QuoteDocumentProps) {
  const subtotal = quote.subtotalKobo / 100;
  const discount = quote.discountKobo / 100;
  const tax = quote.taxKobo / 100;
  const total = quote.totalKobo / 100;
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-6 border-b border-border bg-muted/40 p-5 sm:flex-row sm:justify-between sm:p-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {org.address}
            <br />
            {org.phone} · {org.email}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-sm text-muted-foreground">Quotation</p>
          <h2 className="text-2xl font-bold text-primary">
            QUOTE #{quote.quoteNumber}
          </h2>
          <div className="mt-2 flex items-center gap-2 sm:justify-end">
            <StatusBadge status={quote.status} map={quoteStatus} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Issued {fmtDate(quote.createdAt)}
            <br />
            <span className="font-medium text-foreground">
              Valid until {quote.expiresAt ? fmtDate(quote.expiresAt) : "N/A"}
            </span>
          </p>
        </div>
      </div>
      <div className="grid gap-6 border-b border-border p-5 sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Prepared for
          </p>
          <p className="mt-1 font-semibold text-foreground">
            {customer?.name ?? "Customer"}
          </p>
          <p className="text-sm text-muted-foreground">{customer?.email}</p>
          <p className="text-sm text-muted-foreground">{customer?.phone}</p>
        </div>
        {request && (
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Service details
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {request.requestedServices
                ?.map((service) => service.name)
                .join(", ")}
            </p>
            {request.location && (
              <p className="text-sm text-muted-foreground">
                {request.location.address}
                {request.location.city ? `, ${request.location.city}` : ""}
              </p>
            )}
            {request.preferred?.date && (
              <p className="text-sm text-muted-foreground">
                Preferred: {fmtDate(request.preferred.date)}
                {request.preferred.time ? `, ${request.preferred.time}` : ""}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="p-5 sm:p-8">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto px-0 pb-3 text-xs text-muted-foreground">
                Item
              </TableHead>
              <TableHead className="h-auto px-0 pb-3 text-right text-xs text-muted-foreground">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-0 py-3 pr-4 whitespace-normal text-foreground/90 h-auto">
                  {item.description}
                </TableCell>
                <TableCell className="px-0 py-3 text-right ">
                  {naira(item.totalKobo ? item.totalKobo / 100 : item.amount ?? 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="ml-auto mt-5 max-w-xs space-y-2 border-t border-border pt-4">
          <Money label="Subtotal" value={naira(subtotal)} />

          {discount > 0 && (
            <Money label="Discount" value={`−${naira(discount)}`} negative />
          )}

          {tax > 0 && (
            <Money label={`Tax (${quote.taxRate}%)`} value={naira(tax)} />
          )}

          <div className="border-t border-border pt-3">
            <Money label="Total" value={naira(total)} strong />
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-muted/40 p-5 sm:p-8">
        <h3 className="text-sm font-semibold text-foreground">
          Terms and conditions
        </h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {quote.terms
            .split("\n")
            .filter(Boolean)
            .map((l: string) => (
              <li key={l}>{l}</li>
            ))}
        </ul>
      </div>
    </Card>
  );
}
