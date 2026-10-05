"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageSkeleton, ErrorState } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { Button as UiButton } from "@/components/ui/button";
import { DateField, Input, Select, Textarea } from "@/components/kit/Field";
import { Money } from "@/components/kit/Misc";
import { ConfirmDialog } from "@/components/kit/Dialog";
import { naira } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useCreateQuote } from "@/lib/hooks/mutations/use-quotes";
import {
  useAdminCleaningRequest,
  useAdminCleaningRequests,
} from "@/lib/hooks/queries/use-admin-cleaning-requests";

const TODAY = new Date().toISOString().slice(0, 10);
const DEFAULT_TERMS = "Payment in full is required to confirm your booking. This quote covers only the services and scope listed above.";

const schema = z.object({
  requestId: z.string().min(1, "Select the request this quote is for"),
  items: z
    .array(
      z.object({
        description: z.string().min(2, "Describe the item"),
        amount: z.coerce
          .number({ error: "Enter an amount" })
          .positive("Must be more than 0"),
      }),
    )
    .min(1, "Add at least one item"),
  discount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  validUntil: z.string().min(1, "Choose an expiry date"),
  terms: z.string().min(10, "Add terms for the customer"),
});
type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;
const plusDays = (n: number) => {
  const x = new Date(TODAY + "T00:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
const blank = () => ({
  description: "",
  amount: undefined,
});

function Builder() {
  const router = useRouter();
  const requestId = useSearchParams().get("request") ?? "";
  const {
    data: requests = [],
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useAdminCleaningRequests();

  const createQuoteMutation = useCreateQuote();
  const [confirm, setConfirm] = useState(false);
  const f = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: {
      requestId: requestId || "",
      items: [blank()],
      discount: 0,
      taxRate: 0,
      validUntil: plusDays(7),
      terms: DEFAULT_TERMS,
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control: f.control,
    name: "items",
  });
  const w = useWatch({ control: f.control });
  const rid = w.requestId ?? "";
  const {
    data: requestData,
    isLoading: requestLoading,
    error: requestError,
    refetch: refetchRequest,
  } = useAdminCleaningRequest(rid);

  useEffect(() => {
    const services = requestData?.request.requestedServices;

    if (!services?.length) return;

    const currentItems = f.getValues("items");

    if (currentItems.some((item) => item.description)) return;

    replace(
      services.map((service) => ({
        description: service.name,
        amount: undefined as unknown as number,
      })),
    );
  }, [requestData, replace, f]);

  if (requestsLoading || (rid && requestLoading)) return <PageSkeleton />;
  if (requestsError || requestError) {
    const error = requestsError ?? requestError;
    return <ErrorState message={getApiErrorMessage(error)} onRetry={() => void (requestsError ? refetchRequests() : refetchRequest())} />;
  }
  const req = requestData?.request;
  const subtotal = (w.items ?? []).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const discount = Math.min(Number(w.discount) || 0, subtotal);
  const tax = Math.round(((subtotal - discount) * (Number(w.taxRate) || 0)) / 100);
  const t = { subtotal, discount, tax, total: subtotal - discount + tax };

  const send = f.handleSubmit(
    async (v) => {
      try {
        const q = await createQuoteMutation.mutateAsync({
          requestId: v.requestId,

          items: v.items.map((item) => ({
            description: item.description,
            amount: Number(item.amount),
          })),

          discount: Number(v.discount) || 0,

          taxRate: Number(v.taxRate) || 0,

          validUntil: v.validUntil,

          terms: v.terms,
        });

        toast.success(`Quote ${q.quoteNumber} sent successfully.`);

        setConfirm(false);

        router.push(`/admin/requests/${v.requestId}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to send quote.",
        );
      }
    },
    () => {
      setConfirm(false);
      toast.error("Fix the highlighted fields before sending.");
    },
  );
  const e = f.formState.errors;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/quotes", label: "Quotes" }}
        title="Create quote"
        description="Itemise the work. The customer reviews it, accepts or declines, then pays."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Request" />
            <CardBody>
              <Select
                label="Cleaning request"
                placeholder="Choose a request"
                value={rid}
                options={requests
                  .filter((request) => ["submitted", "reviewing", "inspection_required"].includes(request.status))
                  .map((request) => ({
                    value: request.id,
                    label: `${request.reference} · ${request.customer.name}`,
                  }))}
                error={e.requestId?.message}
                {...f.register("requestId")}
              />
              {requestData ? (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {requestData.request.reference}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {requestData.customer.name}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {requestData.request.requestedServices
                        .map((service) => service.name)
                        .join(", ")}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/requests/${requestData.request.id}`)
                    }
                  >
                    View request
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Loading request...
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Line items"
              description="Final pricing is set here. Services don't carry fixed prices."
            />
            <CardBody className="space-y-3">
              <div className="hidden gap-3 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_160px_40px]">
                <span>Description</span>
                <span>Amount (₦)</span>
                <span />
              </div>
              {fields.map((fl, i) => (
                <div
                  key={fl.id}
                  className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_160px_40px] sm:items-start sm:border-0 sm:p-0"
                >
                  <Input
                    aria-label={`Item ${i + 1} description`}
                    placeholder="e.g. Deep Cleaning"
                    error={e.items?.[i]?.description?.message}
                    {...f.register(`items.${i}.description`)}
                  />
                  <Input
                    aria-label={`Item ${i + 1} amount`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    error={e.items?.[i]?.amount?.message}
                    {...f.register(`items.${i}.amount`)}
                  />
                  <UiButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(i)}
                    disabled={fields.length === 1}
                    aria-label={`Remove item ${i + 1}`}
                    className="h-11 w-full text-muted-foreground/70 hover:bg-red-50 hover:text-destructive disabled:opacity-30 sm:w-10"
                  >
                    <Trash2 />
                  </UiButton>
                </div>
              ))}
              {e.items?.message && (
                <p role="alert" className="text-sm text-destructive">
                  {e.items.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => append(blank())}
                >
                  <Plus className="h-4 w-4" />
                  Add item
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({ description: "Transportation", amount: 3000 })
                  }
                >
                  + Transportation
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Adjustments and terms" />
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Discount (₦)"
                  type="number"
                  min={0}
                  {...f.register("discount")}
                />
                <Input
                  label="Tax (%)"
                  type="number"
                  min={0}
                  max={100}
                  hint="Leave 0 if not applicable"
                  {...f.register("taxRate")}
                />
                <DateField
                  control={f.control}
                  name="validUntil"
                  label="Valid until"
                  min={TODAY}
                  error={e.validUntil?.message}
                />
              </div>
              <Textarea
                label="Terms and conditions"
                rows={6}
                error={e.terms?.message}
                {...f.register("terms")}
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="lg:sticky lg:top-24">
            <CardHeader title="Summary" />
            <CardBody className="space-y-2.5">
              <Money label="Subtotal" value={naira(t.subtotal)} />
              {t.discount > 0 && (
                <Money
                  label="Discount"
                  value={`−${naira(t.discount)}`}
                  negative
                />
              )}
              {t.tax > 0 && (
                <Money label={`Tax (${w.taxRate}%)`} value={naira(t.tax)} />
              )}
              <div className="border-t border-border pt-3">
                <Money label="Total" value={naira(t.total)} strong />
              </div>
              <Button
                size="lg"
                full
                className="mt-3"
                onClick={() => setConfirm(true)}
              >
                <Send className="h-4 w-4" />
                Send quote
              </Button>
            </CardBody>
          </Card>
          {req && (
            <Card>
              <CardHeader title="Request details" />
              <CardBody>
                <p className="font-semibold">{req.requestedServices.map((service) => service.name).join(", ")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[req.address.addressLine1, req.address.area, req.address.city, req.address.state].filter(Boolean).join(", ")}
                </p>
                {req.notes && <p className="mt-3 whitespace-pre-line text-sm text-foreground/80">{req.notes}</p>}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={send}
        loading={createQuoteMutation.isPending}
        title="Send this quote?"
        description={`${naira(t.total)} will be sent to ${requestData?.customer.name ?? "the customer"}. They can accept or decline from their dashboard.`}
        confirmLabel="Send quote"
      />
    </>
  );
}
export default function CreateQuotePage() {
  return (
    <Suspense>
      <Builder />
    </Suspense>
  );
}
