"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Search,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, DetailList } from "@/components/kit/Card";
import { Badge } from "@/components/kit/Badge";
import { useSubmission } from "@/lib/submission";
import { fmtLong, fmtTime } from "@/lib/utils";

const next = [
  {
    icon: ClipboardCheck,
    t: "We review your requirements",
    d: "A member of our team goes through your details and photos.",
  },
  {
    icon: Search,
    t: "We may inspect the space",
    d: "For larger or complex jobs we'll arrange a visit before quoting.",
  },
  {
    icon: FileText,
    t: "You receive a quotation",
    d: "We notify you by email and SMS. You verify your details to view it.",
  },
  {
    icon: ThumbsUp,
    t: "You decide",
    d: "Accept and pay to confirm a booking, or decline at no cost.",
  },
];

export function RequestSuccess({
  reference,
  variant,
}: {
  reference: string;
  variant: "public" | "account";
}) {
  const sub = useSubmission(reference);
  const r = sub?.request;

  return (
    <div className="animate-pop-in mx-auto max-w-2xl py-4" role="status">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-bold text-primary">
          Your cleaning request has been submitted successfully.
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Our team will review your requirements and contact you with the next
          steps.{" "}
          <strong className="text-foreground">
            This is not a confirmed booking yet.
          </strong>
        </p>

        <Card className="mx-auto mt-6 inline-block gap-0 px-6 py-3 shadow-none">
          <p className="text-xs text-muted-foreground">
            Your request reference
          </p>
          <p className="text-2xl font-bold tracking-wide text-primary">
            {reference}
          </p>
        </Card>

        <p className="mt-2 text-sm text-muted-foreground">
          Keep this reference to track your request.
        </p>
      </div>

      {r && (
        <Card className="mt-8">
          <CardBody>
            <h2 className="mb-4 font-semibold text-foreground">
              Summary of your request
            </h2>

            <DetailList
              items={[
                {
                  label: "Environment",
                  value: r.propertyType,
                },
                {
                  label: "Services",
                  value: (
                    <span className="flex flex-wrap gap-1.5">
                      {r.requestedServices.map((service) => (
                        <Badge key={service.serviceId} tone="info">
                          {sub?.serviceNames[service.serviceId] ??
                            service.serviceId}
                        </Badge>
                      ))}
                    </span>
                  ),
                },
                {
                  label: "Location",
                  value: (
                    <>
                      <span>
                        {r.address.addressLine1}, {r.address.area}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {r.address.city}, {r.address.state}, {r.address.country}
                      </span>
                    </>
                  ),
                },
                {
                  label: "Preferred schedule",
                  value: `${fmtLong(
                    r.preferredDate.toISOString(),
                  )}, ${fmtTime(r.preferredTimeSlot)}${
                    r.schedule.flexible ? " (flexible)" : ""
                  }`,
                },
                {
                  label: "Contact",
                  value: `${r.contact.name} · ${r.contact.phone}`,
                },
                {
                  label: "Email",
                  value: r.contact.email,
                },
              ]}
            />
          </CardBody>
        </Card>
      )}

      <Card className="mt-6 p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">What happens next</h2>

          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Usually within 1 business day
          </span>
        </div>

        <ol className="space-y-4">
          {next.map((n, i) => (
            <li key={n.t} className="flex gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-primary">
                <n.icon className="h-[18px] w-[18px]" />
              </span>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  {i + 1}. {n.t}
                </p>
                <p className="text-sm text-muted-foreground">{n.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {variant === "public" ? (
          <>
            <Button href={`/request/${reference}`} size="lg">
              Track your request
            </Button>

            <Button href="/" variant="secondary" size="lg">
              Return home
            </Button>
          </>
        ) : (
          <>
            <Button href="/dashboard/requests" size="lg">
              View my requests
            </Button>

            <Button href="/dashboard" variant="secondary" size="lg">
              Back to dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
