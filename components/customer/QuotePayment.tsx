"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import PaystackPop from "@paystack/inline-js";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  useInitializeCustomerPayment,
  useCustomerPayment,
  useVerifyCustomerPayment,
} from "@/lib/hooks/queries/payments";

type QuotePaymentProps = {
  reference: string;
  amountKobo: number;
};

type BookingConfirmation = {
  id: string;
  bookingNumber: string;
  status: string;
  confirmedAt: string;
};

export function QuotePayment({ reference, amountKobo }: QuotePaymentProps) {
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  const initializePayment = useInitializeCustomerPayment(reference);
  const { data: paymentStatus } = useCustomerPayment(reference);
  const verifyPayment = useVerifyCustomerPayment(reference);
  const confirmedBooking =
    booking ??
    (paymentStatus?.payment?.status === "success"
      ? paymentStatus.booking
      : null);

  async function handlePayment() {
    try {
      setPaymentStarted(true);

      const result = await initializePayment.mutateAsync();

      const popup = new PaystackPop();

      popup.resumeTransaction(result.accessCode, {
        onSuccess: async () => {
          try {
            const verified = await verifyPayment.mutateAsync();

            if (!verified.booking) {
              throw new Error("Payment verified without a booking.");
            }

            setBooking(verified.booking);
            toast.success("Payment successful. Your booking is confirmed.");
          } catch {
            toast.error(
              "Payment was received, but we couldn't confirm it yet. Please refresh in a moment.",
            );
          } finally {
            setPaymentStarted(false);
          }
        },
        onCancel: () => {
          setPaymentStarted(false);
          toast.info("Payment cancelled");
        },
        onError: (error) => {
          setPaymentStarted(false);
          toast.error(error.message || "Unable to open Paystack checkout.");
        },
      });
    } catch {
      setPaymentStarted(false);

      toast.error("Unable to start payment. Please try again.");
    }
  }

  const amount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amountKobo / 100);

  if (confirmedBooking) {
    return (
      <div className="rounded-lg border p-5">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-6 text-green-600" />

          <div>
            <p className="font-semibold">Booking confirmed</p>
            <p className="text-sm text-muted-foreground">
              Your payment was successful.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 rounded-lg bg-muted/50 p-4">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Booking number
            </span>
            <span className="font-medium">
              {confirmedBooking.bookingNumber}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="font-medium">{confirmedBooking.status}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Confirmed</span>
            <span className="text-right font-medium">
              {new Intl.DateTimeFormat("en-NG", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(confirmedBooking.confirmedAt))}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Amount paid</span>
            <span className="font-medium">{amount}</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          We&apos;ll contact you using the contact details provided with your
          cleaning request.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CreditCard className="size-5" />
        </span>

        <div>
          <p className="font-medium">Complete your payment</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Pay {amount} to confirm your cleaning booking.
          </p>
        </div>
      </div>

      <Button
        className="mt-4 w-full"
        onClick={handlePayment}
        disabled={
          paymentStarted ||
          initializePayment.isPending ||
          verifyPayment.isPending
        }
      >
        {paymentStarted ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Opening payment...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" />
            Pay {amount}
          </>
        )}
      </Button>
    </div>
  );
}
