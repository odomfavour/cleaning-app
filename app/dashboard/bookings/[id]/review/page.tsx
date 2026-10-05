"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/kit/Button";
import { Card, CardBody } from "@/components/kit/Card";
import { ErrorState, PageHeader, PageSkeleton } from "@/components/kit/Page";
import { Textarea } from "@/components/kit/Field";
import { Stars } from "@/components/kit/Misc";
import { FileUploader, type UploadedFile } from "@/components/kit/FileUploader";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getCustomerBooking,
  submitCustomerBookingReview,
} from "@/lib/api/services/customer-booking.service";
import { fmtDate } from "@/lib/utils";

const prompts = [
  "Very poor",
  "Could be better",
  "Good",
  "Very good",
  "Excellent",
];
const bookingKey = (id: string) => ["customer-booking", id] as const;

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const bookingQuery = useQuery({
    queryKey: bookingKey(id),
    queryFn: () => getCustomerBooking(id),
    enabled: !!id,
  });
  const reviewMutation = useMutation({
    mutationFn: () =>
      submitCustomerBookingReview(id, {
        rating,
        comment,
        photos: photos.map((photo) => photo.url),
      }),
    onSuccess: async () => {
      setDone(true);
      await queryClient.invalidateQueries({ queryKey: bookingKey(id) });
      toast.success("Thanks for sharing your feedback.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (bookingQuery.isLoading) return <PageSkeleton />;
  if (bookingQuery.error || !bookingQuery.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(bookingQuery.error)}
        onRetry={() => void bookingQuery.refetch()}
      />
    );
  }

  const booking = bookingQuery.data;

  if (done || booking.review) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center" role="status">
        <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-10" />
        </div>
        <h1 className="text-3xl font-bold text-primary">
          {done
            ? "Thank you for your review"
            : "You’ve already reviewed this job"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your feedback helps us recognise great work and improve where we can.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/dashboard/request-cleaning" size="lg">
            Request another cleaning
          </Button>
          <Button href="/dashboard" variant="secondary" size="lg">
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (booking.status !== "completed") {
    return (
      <Card>
        <CardBody>
          <ErrorState message="You can review a cleaning once it has been completed." />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        back={{ href: `/dashboard/bookings/${booking.id}`, label: "Booking" }}
        title="How was your cleaning?"
        description={`${booking.title} on ${fmtDate(booking.date ?? undefined)} · ${booking.bookingNumber}`}
      />
      <Card>
        <CardBody className="space-y-6">
          <div className="text-center">
            <p className="mb-1 text-sm font-medium text-foreground">
              Overall rating
            </p>
            <Stars value={rating} onChange={setRating} size={36} />
            <p
              className="mt-1 h-5 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {rating ? prompts[rating - 1] : ""}
            </p>
            {touched && !rating && (
              <p role="alert" className="text-sm text-destructive">
                Select a star rating to continue.
              </p>
            )}
          </div>
          <Textarea
            label="Tell us more (optional)"
            placeholder="What went well? Is there anything we could improve?"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={5000}
            hint={`${comment.length}/5000`}
          />
          <FileUploader
            label="Add photos (optional)"
            value={photos}
            onChange={setPhotos}
            max={4}
            compact
          />
          <Button
            size="lg"
            full
            loading={reviewMutation.isPending}
            onClick={() => {
              setTouched(true);
              if (rating) reviewMutation.mutate();
            }}
          >
            Submit review
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
