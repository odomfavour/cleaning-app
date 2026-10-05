"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { QuotePayment } from "@/components/customer/QuotePayment";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { ErrorState, PageHeader, PageSkeleton } from "@/components/kit/Page";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getCustomerQuoteById } from "@/lib/api/services/quote.service";

const quoteKey = (id: string) => ["customer-quote", id] as const;

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(kobo / 100);
}

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const quoteQuery = useQuery({
    queryKey: quoteKey(id),
    queryFn: () => getCustomerQuoteById(id),
    enabled: !!id,
  });

  if (quoteQuery.isLoading) return <PageSkeleton />;
  if (quoteQuery.error || !quoteQuery.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(quoteQuery.error)}
        onRetry={() => void quoteQuery.refetch()}
      />
    );
  }

  const { quote, request, booking, paymentStatus } = quoteQuery.data;

  if (booking || paymentStatus === "success") {
    return (
      <div className="mx-auto max-w-xl py-10">
        <Card>
          <CardBody className="py-10 text-center">
            <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
            <h1 className="mt-4 text-2xl font-bold">Payment confirmed</h1>
            <p className="mt-2 text-muted-foreground">
              {booking
                ? `Booking ${booking.bookingNumber} is confirmed.`
                : "Your payment has been received."}
            </p>
            <Button href={`/dashboard/quotes/${quote.id}`} className="mt-6">
              View quote
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (quote.status !== "accepted") {
    return (
      <Card>
        <CardHeader title="Payment unavailable" />
        <CardBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Accept this quote before starting payment.
          </p>
          <Button href={`/dashboard/quotes/${quote.id}`}>Review quote</Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        back={{ href: `/dashboard/quotes/${quote.id}`, label: "Back to quote" }}
        title="Secure payment"
        description="Pay with Paystack to confirm your cleaning booking."
      />
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <QuotePayment
            reference={quote.requestReference}
            amountKobo={quote.totalKobo}
          />
        </div>
        <Card className="h-fit lg:col-span-2">
          <CardHeader title="Booking summary" />
          <CardBody className="space-y-3 text-sm">
            <p className="font-semibold">{request.services.join(", ")}</p>
            <p className="text-muted-foreground">{request.address}</p>
            <div className="flex justify-between border-t pt-3">
              <span>Quote total</span>
              <span className="font-semibold">{formatNaira(quote.totalKobo)}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
