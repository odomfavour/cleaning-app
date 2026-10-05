"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CalendarClock,
  FileText,
  LockKeyhole,
  MapPin,
  SearchX,
  ShieldCheck,
} from "lucide-react";

import {
  usePublicRequestStatus,
  useVerifiedRequest,
} from "@/lib/hooks/queries/use-cleaning-request-tracking";

import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { Badge, StatusBadge } from "@/components/kit/Badge";
import { Timeline } from "@/components/kit/Timeline";
import { VerifyAccess } from "@/components/shared/VerifyAccess";

import { requestStatus } from "@/lib/status";
import { trackingTimeline } from "@/lib/timeline";
import { fmtDate, fmtLong, fmtTime } from "@/lib/utils";
import { QuoteReview } from "@/components/customer/QuoteReview";

export default function TrackRequestPage() {
  const { reference } = useParams<{ reference: string }>();
  const ref = decodeURIComponent(reference);

  const [verified, setVerified] = useState(false);

  const {
    data: status,
    isLoading,
    error,
    refetch: reloadStatus,
  } = usePublicRequestStatus(ref);

  const { data: full, isFetching: loadingFull } = useVerifiedRequest(
    ref,
    verified,
  );

  if (isLoading && status === undefined && !error) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "Unable to load this request."
        }
        onRetry={reloadStatus}
      />
    );
  }

  if (!status) {
    return (
      <Card className="mx-auto max-w-lg">
        <div className="px-6 py-14 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="h-6 w-6" />
          </span>

          <h1 className="text-xl font-bold text-foreground">
            We couldn&apos;t find that request
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Check the reference and try again. It looks like{" "}
            <strong>{ref}</strong> and was sent to you after you submitted your
            request.
          </p>

          <Button href="/request" className="mt-6">
            Try another reference
          </Button>
        </div>
      </Card>
    );
  }

  const quoteWaiting = status.hasQuote && status.quoteStatus === "sent";

  const hasFullDetails = verified && !!full;

  const handleVerified = async () => {
    setVerified(true);
  };

  return (
    <>
      <PageHeader
        title={status.reference}
        meta={<StatusBadge status={status.status} map={requestStatus} />}
        description={[
          `Submitted ${fmtDate(status.submittedAt)}`,
          status.propertyType,
        ]
          .filter(Boolean)
          .join(" · ")}
      />

      {quoteWaiting && (
        <Card className="mb-6 border-amber-200 bg-amber-50/70">
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 ring-1 ring-amber-200">
              <FileText className="h-5 w-5" />
            </span>

            <div className="flex-1">
              <p className="font-semibold text-foreground">
                Your quote is ready
              </p>

              <p className="text-sm text-foreground/80">
                {hasFullDetails
                  ? "Review the itemised quotation, then accept or decline it."
                  : "Verify your email or phone below to view it."}
              </p>
            </div>

            {hasFullDetails && full?.quoteId ? (
              <Button href={`/dashboard/quotes/${full.quoteId}`}>
                View quote
              </Button>
            ) : (
              <Button href="#verify" variant="secondary">
                Verify to view
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="h-fit lg:order-last lg:col-span-2">
          <CardHeader title="Progress" />

          <CardBody>
            <Timeline items={trackingTimeline(status)} />
          </CardBody>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader
              title="Request overview"
              description="What anyone with this reference can see."
            />

            <CardBody className="space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Services requested
                </p>

                <div className="flex flex-wrap gap-2">
                  {status.services.map((service) => (
                    <Badge key={service} tone="info">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                We&apos;ll contact you at{" "}
                <strong className="text-foreground">
                  {status.maskedEmail}
                </strong>{" "}
                or{" "}
                <strong className="text-foreground">
                  {status.maskedPhone}
                </strong>
                .
              </p>
            </CardBody>
          </Card>

          {hasFullDetails && full ? (
            <>
              <Alert variant="success">
                <ShieldCheck />

                <AlertDescription className="text-emerald-900">
                  You&apos;re verified. Here are the full details.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader title="Your request" />

                <CardBody className="space-y-5 text-[15px]">
                  {/* Services */}
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Services
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {full.requestedServices.map((service) => (
                        <Badge key={service.serviceId} tone="info">
                          {service.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Property */}
                  {full.propertyType && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Property type
                      </p>

                      <p className="text-foreground">{full.propertyType}</p>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                    <div>
                      <p className="text-foreground">
                        {full.address.addressLine1}
                      </p>

                      <p className="text-muted-foreground">
                        {full.address.area}, {full.address.city}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {full.address.state}, {full.address.country}
                      </p>

                      {full.address.landmark && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Landmark: {full.address.landmark}
                        </p>
                      )}

                      {full.address.directions && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Directions: {full.address.directions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex gap-3">
                    <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

                    <div>
                      <p className="text-foreground">
                        {fmtLong(full.preferredDate)},{" "}
                        {fmtTime(full.preferredTimeSlot)}
                      </p>

                      {full.schedule.flexible && (
                        <p className="text-sm text-muted-foreground">
                          Flexible schedule
                        </p>
                      )}

                      {full.schedule.alternativeDate && (
                        <p className="text-sm text-muted-foreground">
                          Alternative: {fmtLong(full.schedule.alternativeDate)}
                          {full.schedule.alternativeTimeSlot
                            ? `, ${fmtTime(full.schedule.alternativeTimeSlot)}`
                            : ""}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-muted-foreground">
                        Final timing is confirmed after you accept a quote.
                      </p>
                    </div>
                  </div>

                  {/* Property details */}
                  {(full.bedrooms !== undefined ||
                    full.bathrooms !== undefined ||
                    full.propertyDetails.size ||
                    full.propertyDetails.rooms !== undefined ||
                    full.propertyDetails.livingRooms !== undefined ||
                    full.propertyDetails.floors !== undefined ||
                    full.propertyDetails.kitchens !== undefined) && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Property details
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {full.bedrooms !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Bedrooms
                            </p>
                            <p className="text-foreground">{full.bedrooms}</p>
                          </div>
                        )}

                        {full.bathrooms !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Bathrooms
                            </p>
                            <p className="text-foreground">{full.bathrooms}</p>
                          </div>
                        )}

                        {full.propertyDetails.livingRooms !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Living rooms
                            </p>
                            <p className="text-foreground">
                              {full.propertyDetails.livingRooms}
                            </p>
                          </div>
                        )}

                        {full.propertyDetails.rooms !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Rooms
                            </p>
                            <p className="text-foreground">
                              {full.propertyDetails.rooms}
                            </p>
                          </div>
                        )}

                        {full.propertyDetails.floors !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Floors
                            </p>
                            <p className="text-foreground">
                              {full.propertyDetails.floors}
                            </p>
                          </div>
                        )}

                        {full.propertyDetails.kitchens !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Kitchens
                            </p>
                            <p className="text-foreground">
                              {full.propertyDetails.kitchens}
                            </p>
                          </div>
                        )}

                        {full.propertyDetails.size && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Size
                            </p>
                            <p className="text-foreground">
                              {full.propertyDetails.size}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {full.notes && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Additional information
                      </p>

                      <p className="whitespace-pre-line text-foreground/80">
                        {full.notes}
                      </p>
                    </div>
                  )}

                  {/* Contact */}
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Contact
                    </p>

                    <p className="text-foreground">{full.contact.name}</p>

                    <p className="text-sm text-muted-foreground">
                      {full.contact.phone} · {full.contact.email}
                    </p>
                  </div>
                </CardBody>
              </Card>

              <div id="quote" className="scroll-mt-24">
                {status.hasQuote && (
                  <QuoteReview reference={status.reference} />
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {full.quoteId && status.quoteStatus === "sent" && (
                  <Button href={`/dashboard/quotes/${full.quoteId}`}>
                    View quote
                  </Button>
                )}

                {full.quoteId &&
                  status.quoteStatus === "accepted" &&
                  !full.bookingId && (
                    <Button href={`/dashboard/payment/${full.quoteId}`}>
                      Continue to payment
                    </Button>
                  )}

                {full.bookingId && (
                  <Button href={`/dashboard/bookings/${full.bookingId}`}>
                    View booking
                  </Button>
                )}

                {!full.hasAccount && (
                  <Button
                    href={`/register?email=${encodeURIComponent(full.contact.email)}&next=${encodeURIComponent("/dashboard/requests")}`}
                    variant="secondary"
                  >
                    Create an account
                  </Button>
                )}

                <Button
                  href={`/dashboard/requests/${full.id}`}
                  variant="secondary"
                >
                  Open full request
                </Button>
              </div>
            </>
          ) : (
            <div id="verify" className="scroll-mt-24">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="h-4 w-4" />
                Contact details, address, quotes and payments are private.
              </div>

              <VerifyAccess
                reference={status.reference}
                maskedEmail={status.maskedEmail}
                maskedPhone={status.maskedPhone}
                onVerified={handleVerified}
                title="Verify to see full details"
                nextHref={`/request/${status.reference}`}
              />

              {verified && loadingFull && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Loading your request details...
                </p>
              )}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Questions?{" "}
            <Link
              href="tel:+2348035550142"
              className="font-medium text-blue-700 hover:underline"
            >
              Call +234 803 555 0142
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
