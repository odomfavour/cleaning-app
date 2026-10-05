"use client";

import { useState } from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAcceptCustomerQuote,
  useCustomerQuote,
  useDeclineCustomerQuote,
} from "@/lib/hooks/queries/quotes";
import { QuotePayment } from "./QuotePayment";

type QuoteReviewProps = {
  reference: string;
};

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(kobo / 100);
}

function formatDate(value?: string) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function QuoteReview({ reference }: QuoteReviewProps) {
  const [confirmingDecline, setConfirmingDecline] = useState(false);

  const { data: quote, isLoading, error } = useCustomerQuote(reference);

  const acceptMutation = useAcceptCustomerQuote(reference);
  const declineMutation = useDeclineCustomerQuote(reference);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          Loading your quote...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your quote.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm text-muted-foreground">
            A quote has not been issued for this request yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const canRespond = quote.status === "sent";

  async function handleAccept() {
    try {
      await acceptMutation.mutateAsync();
      toast.success("Quote accepted");
    } catch {
      toast.error("Unable to accept quote");
    }
  }

  async function handleDecline() {
    try {
      await declineMutation.mutateAsync();
      setConfirmingDecline(false);
      toast.success("Quote declined");
    } catch {
      toast.error("Unable to decline quote");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Cleaning quote</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              {quote.quoteNumber}
            </p>
          </div>

          <QuoteStatus status={quote.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {quote.expiresAt && quote.status === "sent" && (
          <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
            <Clock className="size-4" />

            <span>
              Quote expires on <strong>{formatDate(quote.expiresAt)}</strong>.
            </span>
          </div>
        )}

        <div className="divide-y rounded-lg border">
          {quote.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium">{item.description}</p>

                <p className="text-sm text-muted-foreground">
                  {item.quantity} × {formatNaira(item.unitPriceKobo)}
                </p>
              </div>

              <p className="font-medium">{formatNaira(item.totalKobo)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatNaira(quote.subtotalKobo)}</span>
          </div>

          {quote.discountKobo > 0 && (
            <div className="flex justify-between text-sm">
              <span>Discount</span>
              <span>-{formatNaira(quote.discountKobo)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatNaira(quote.totalKobo)}</span>
          </div>
        </div>

        {canRespond && !confirmingDecline && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={acceptMutation.isPending}
            >
              <CheckCircle2 className="size-4" />

              {acceptMutation.isPending ? "Accepting..." : "Accept quote"}
            </Button>

            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmingDecline(true)}
              disabled={declineMutation.isPending}
            >
              <XCircle className="size-4" />
              Decline quote
            </Button>
          </div>
        )}

        {canRespond && confirmingDecline && (
          <div className="rounded-lg border p-4">
            <p className="font-medium">Decline this quote?</p>

            <p className="mt-1 text-sm text-muted-foreground">
              You can contact our team if you&apos;d like to discuss the
              quotation before proceeding.
            </p>

            <div className="mt-4 flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={declineMutation.isPending}
              >
                {declineMutation.isPending ? "Declining..." : "Yes, decline"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setConfirmingDecline(false)}
                disabled={declineMutation.isPending}
              >
                Keep quote
              </Button>
            </div>
          </div>
        )}

        {quote.status === "accepted" && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">Quote accepted.</p>

            <p className="mt-1 text-muted-foreground">
              Your next step is payment to confirm the cleaning booking.
            </p>
            <QuotePayment reference={reference} amountKobo={quote.totalKobo} />
          </div>
        )}

        {quote.status === "declined" && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">Quote declined.</p>

            <p className="mt-1 text-muted-foreground">
              Contact our team if you would like to discuss another option.
            </p>
          </div>
        )}

        {quote.status === "expired" && (
          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">This quote has expired.</p>

            <p className="mt-1 text-muted-foreground">
              Contact our team if you still need the cleaning service.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuoteStatus({ status }: { status: string }) {
  const label =
    status === "sent"
      ? "Awaiting response"
      : status === "accepted"
        ? "Accepted"
        : status === "declined"
          ? "Declined"
          : status === "expired"
            ? "Expired"
            : "Draft";

  return (
    <span className="rounded-full border px-3 py-1 text-xs font-medium">
      {label}
    </span>
  );
}
