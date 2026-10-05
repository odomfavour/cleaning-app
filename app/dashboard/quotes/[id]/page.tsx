"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { ConfirmDialog } from "@/components/kit/Dialog";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getCustomerQuoteById,
  respondToCustomerQuote,
} from "@/lib/api/services/quote.service";

const quoteKey = (id: string) => ["customer-quote", id] as const;

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(kobo / 100);
}

export default function QuotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [declineOpen, setDeclineOpen] = useState(false);
  const quoteQuery = useQuery({
    queryKey: quoteKey(id),
    queryFn: () => getCustomerQuoteById(id),
    enabled: !!id,
  });
  const responseMutation = useMutation({
    mutationFn: (action: "accept" | "decline") =>
      respondToCustomerQuote(id, action),
    onSuccess: async (_result, action) => {
      setDeclineOpen(false);
      if (action === "accept") {
        toast.success("Quote accepted. One last step: payment.");
        router.push(`/dashboard/payment/${id}`);
        return;
      }
      toast("Quote declined.");
      await queryClient.invalidateQueries({ queryKey: quoteKey(id) });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
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

  const { quote, request, booking } = quoteQuery.data;
  const expired =
    quote.status === "sent" &&
    !!quote.expiresAt &&
    new Date(quote.expiresAt) <= new Date();
  const actionable = quote.status === "sent" && !expired;

  return (
    <>
      <PageHeader
        back={{ href: "/dashboard/requests", label: "My requests" }}
        title="Your quotation"
        description={`Quote ${quote.quoteNumber}`}
      />
      <div className="mx-auto max-w-3xl space-y-5">
        {quote.status === "accepted" && (
          <Banner tone="green" icon={CheckCircle2}>
            {booking
              ? "Your booking is confirmed."
              : "Quote accepted. Complete payment to confirm your booking."}
          </Banner>
        )}
        {quote.status === "declined" && (
          <Banner tone="red" icon={XCircle}>You declined this quote.</Banner>
        )}
        {(quote.status === "expired" || expired) && (
          <Banner tone="amber" icon={AlertTriangle}>
            This quote has expired. Contact our team to request an update.
          </Banner>
        )}
        <Card>
          <CardHeader title="Cleaning quote" />
          <CardBody className="space-y-5">
            <div>
              <p className="font-semibold">{request.services.join(", ")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{request.address}</p>
              {request.preferredDate && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Preferred date: {new Date(request.preferredDate).toLocaleDateString("en-NG")}
                  {request.preferredTimeSlot ? `, ${request.preferredTimeSlot}` : ""}
                </p>
              )}
            </div>
            <div className="divide-y rounded-lg border">
              {quote.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 p-4 text-sm">
                  <span>
                    {item.description} <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="font-medium">{formatNaira(item.totalKobo)}</span>
                </div>
              ))}
            </div>
            {quote.discountKobo > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>-{formatNaira(quote.discountKobo)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-4 text-lg font-semibold">
              <span>Total</span>
              <span>{formatNaira(quote.totalKobo)}</span>
            </div>
            {actionable && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => responseMutation.mutate("accept")}
                  loading={responseMutation.isPending && responseMutation.variables === "accept"}
                >
                  Accept &amp; continue to payment
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setDeclineOpen(true)}
                  disabled={responseMutation.isPending}
                >
                  Decline quote
                </Button>
              </div>
            )}
            {quote.status === "accepted" && !booking && (
              <Button href={`/dashboard/payment/${quote.id}`}>
                Continue to payment
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
      <ConfirmDialog
        open={declineOpen}
        onClose={() => setDeclineOpen(false)}
        onConfirm={() => responseMutation.mutate("decline")}
        loading={responseMutation.isPending && responseMutation.variables === "decline"}
        tone="danger"
        title="Decline this quote?"
        description="This quote will be closed. Contact our team if you would like to discuss it first."
        confirmLabel="Decline quote"
      />
    </>
  );
}

function Banner({ tone, icon: Icon, children }: { tone: "green" | "red" | "amber"; icon: typeof XCircle; children: React.ReactNode }) {
  const c = { green: "border-emerald-200 bg-emerald-50 text-emerald-900", red: "border-red-200 bg-red-50 text-red-900", amber: "border-amber-200 bg-amber-50 text-amber-900" }[tone];
  return <div role="status" className={`flex gap-3 rounded-xl border p-4 text-sm ${c}`}><Icon className="mt-0.5 h-5 w-5 shrink-0" /><p>{children}</p></div>;
}
