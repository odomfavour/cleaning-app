"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  HardHat,
  Home,
  Info,
  MapPin,
  MoreHorizontal,
  PartyPopper,
  Send,
  Store,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useApi } from "@/lib/hooks";
import { useRegisterCustomer } from "@/lib/hooks/queries/use-auth";
import { saveSubmission } from "@/lib/submission";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, DetailList } from "@/components/kit/Card";
import { Badge } from "@/components/kit/Badge";
import { CheckboxCard, RadioCard, RadioGroup } from "@/components/kit/Choice";
import { Button as UiButton } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckboxField,
  DateField,
  Input,
  Select,
  TimePicker,
  Textarea,
} from "@/components/kit/Field";
import {
  FileUploader,
  PhotoGrid,
  type UploadedFile,
} from "@/components/kit/FileUploader";
import { Skeleton } from "@/components/kit/Page";
import { propertyItems } from "@/components/shared/RequestSummary";
import { environmentLabel } from "@/lib/status";
import type { CleaningRequest, Environment } from "@/lib/types";
import { cn, fmtLong, fmtTime } from "@/lib/utils";
import {
  ENVIRONMENTS,
  MIN_DATE,
  STEPS,
  STEP_FIELDS,
  isResidential,
  wizardSchema,
  type WizardValues,
} from "./schema";
import { useServices } from "@/lib/hooks/queries/use-services";
import { useCreateCleaningRequest } from "@/lib/hooks/mutations/use-creating-requests";

/**
 * One request form, two entry points:
 *  - mode="public":  /request-cleaning            (no account; contact details collected in the form)
 *  - mode="account": /dashboard/request-cleaning  (logged in; contact + addresses prefilled, can reuse earlier requests)
 */
export type FormMode = "public" | "account";

const envMeta: Record<
  (typeof ENVIRONMENTS)[number],
  { icon: LucideIcon; hint: string }
> = {
  house: { icon: Home, hint: "Detached, duplex or bungalow" },
  apartment: { icon: Building2, hint: "Flat or serviced apartment" },
  office: { icon: Briefcase, hint: "Workspaces and meeting rooms" },
  restaurant: { icon: UtensilsCrossed, hint: "Kitchens and dining areas" },
  event_venue: { icon: PartyPopper, hint: "Halls, lounges and venues" },
  commercial: { icon: Store, hint: "Shops, clinics and retail" },
  construction: { icon: HardHat, hint: "Post-build and renovation" },
  other: { icon: MoreHorizontal, hint: "Something different" },
};
const recommended: Partial<Record<Environment, string[]>> = {
  house: ["regular", "deep", "carpet", "window", "sofa"],
  apartment: ["regular", "deep", "move-in", "move-out"],
  office: ["office", "window", "carpet"],
  restaurant: ["commercial", "deep"],
  event_venue: ["commercial"],
  commercial: ["commercial", "window"],
  construction: ["post-construction"],
};
const count = (max: number, zero = false) =>
  Array.from({ length: max + (zero ? 1 : 0) }, (_, i) => {
    const n = zero ? i : i + 1;
    return { value: String(n), label: String(n) };
  });
const sizes = [
  "Under 50 sqm",
  "50–100 sqm",
  "100–200 sqm",
  "200–400 sqm",
  "Over 400 sqm",
].map((s) => ({ value: s, label: s }));
const str = (v: unknown) =>
  v === undefined || v === null || v === false ? "" : String(v);
const splitFullName = (value: string) => {
  const [firstName, ...lastNames] = value.trim().split(/\s+/);
  return { firstName, lastName: lastNames.join(" ") || firstName };
};

export function RequestForm({ mode }: { mode: FormMode }) {
  const router = useRouter();
  const account = mode === "account";
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [registeredAccount, setRegisteredAccount] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const prefilled = useRef(false);
  const { data: services = [], isLoading, isError, refetch } = useServices();
  const createRequest = useCreateCleaningRequest();
  const registerCustomer = useRegisterCustomer();

  const { data: me } = useApi(
    () => (account ? api.customers.me() : Promise.resolve(null)),
    [mode],
  );
  const { data: previous } = useApi(
    () =>
      account
        ? api.requests.getAll({ customerId: api.session.customerId })
        : Promise.resolve([] as CleaningRequest[]),
    [mode],
  );
  const f = useForm<WizardValues>({
    resolver: zodResolver(wizardSchema),
    mode: "onTouched",
    defaultValues: {
      services: [],
      country: "Nigeria",
      state: "Rivers State",
      city: "Port Harcourt",
      flexible: false,
      createAccount: false,
      accountPassword: "",
      accountPasswordConfirm: "",
      consent: account ? true : undefined,
    },
  });
  const {
    register,
    control,
    watch,
    trigger,
    setValue,
    handleSubmit,
    getValues,
    formState: { errors },
  } = f;
  const v = watch();
  const residential = isResidential(v.environment);

  // Account mode: prefill contact details from the profile, once.
  useEffect(() => {
    if (!me || prefilled.current) return;
    prefilled.current = true;
    setValue("contactName", me.name);
    setValue("contactEmail", me.email);
    setValue("contactPhone", me.phone);
    setValue("consent", true);
  }, [me, setValue]);
  useEffect(() => {
    top.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  const err = (k: keyof WizardValues) =>
    errors[k]?.message as string | undefined;
  const reg = (k: Path<WizardValues>) => register(k);
  const next = async () => {
    if (await trigger(STEP_FIELDS[step] as Path<WizardValues>[]))
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const reuse = (id: string) => {
    const r = previous?.find((x) => x.id === id);
    if (!r) return;
    const p = r.property;
    setValue("environment", r.environment, { shouldValidate: true });
    setValue(
      "services",
      r.services
        .map((n) => services?.find((s) => s.name === n)?.id)
        .filter(Boolean) as string[],
    );
    (
      [
        "bedrooms",
        "bathrooms",
        "livingRooms",
        "floors",
        "rooms",
        "additional",
      ] as const
    ).forEach((k) => setValue(k, str(p[k])));
    setValue("kitchens", str(p.kitchen));
    setValue(
      "size",
      isResidential(r.environment)
        ? str(p.size)
        : str(p.size).replace(/\D/g, ""),
    );
    setValue("address", r.location.address);
    setValue("area", r.location.area);
    setValue("city", r.location.city);
    setValue("landmark", r.location.landmark);
    setValue("directions", r.location.directions);
    toast.success(
      `Details copied from ${r.id}. Review each step before submitting.`,
    );
  };

  const buildRequest = (x: WizardValues) => {
    const n = (s?: string) => (s && /^\d+$/.test(s) ? Number(s) : undefined);

    return {
      contact: {
        name: x.contactName.trim(),
        email: x.contactEmail.trim(),
        phone: x.contactPhone.trim(),
      },

      requestedServices: x.services.map((serviceId) => ({
        serviceId,
      })),

      address: {
        addressLine1: x.address,
        area: x.area,
        city: x.city,
        state: x.state,
        country: x.country,
        landmark: x.landmark || undefined,
        directions: x.directions || undefined,
      },

      propertyType: x.environment,

      bedrooms: n(x.bedrooms),
      bathrooms: n(x.bathrooms),

      propertyDetails: {
        environment: x.environment,

        livingRooms: n(x.livingRooms),
        floors: n(x.floors),
        kitchens: n(x.kitchens),
        rooms: n(x.rooms),

        size: x.size || undefined,
        additional: x.additional || undefined,
      },

      preferredTimeSlot: x.time,
      preferredDate: new Date(`${x.date}T00:00:00`),

      schedule: {
        alternativeDate: x.altDate
          ? new Date(`${x.altDate}T00:00:00`)
          : undefined,
        alternativeTimeSlot: x.altTime || undefined,
        flexible: !!x.flexible,
      },

      notes: [
        x.description ? `Description:\n${x.description}` : "",
        x.specialRequirements
          ? `Additional requirements:\n${x.specialRequirements}`
          : "",
        x.attentionAreas
          ? `Areas needing special attention:\n${x.attentionAreas}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),

      photos: photos.map((p) => p.url),
    };
  };
  const buildPreview = (x: WizardValues) => {
    const serviceNames = x.services
      .map((id) => services.find((service) => service.id === id)?.name)
      .filter(Boolean) as string[];

    return {
      environment: x.environment,
      services: serviceNames,

      property: {
        bedrooms: x.bedrooms,
        bathrooms: x.bathrooms,
        livingRooms: x.livingRooms,
        floors: x.floors,
        kitchen: x.kitchens,
        rooms: x.rooms,
        size: x.size,
        additional: x.additional,
      },

      description: x.description,
      specialRequirements: x.specialRequirements,
      attentionAreas: x.attentionAreas,
      photos: photos.map((p) => p.url),

      location: {
        address: x.address,
        area: x.area,
        city: x.city,
        state: x.state,
        country: x.country,
        landmark: x.landmark,
        directions: x.directions,
      },

      preferred: {
        date: x.date,
        time: x.time,
        altDate: x.altDate,
        altTime: x.altTime,
        flexible: x.flexible,
      },

      contact: {
        name: x.contactName,
        phone: x.contactPhone,
        email: x.contactEmail,
      },
    };
  };
  const submit = handleSubmit(async (x) => {
    try {
      setSubmitting(true);

      if (!account && x.createAccount && !registeredAccount) {
        const { firstName, lastName } = splitFullName(x.contactName);
        await registerCustomer.mutateAsync({
          firstName,
          lastName,
          email: x.contactEmail.trim(),
          phone: x.contactPhone.trim(),
          password: x.accountPassword ?? "",
        });
        setRegisteredAccount(true);
      }

      const body = buildRequest(x);

      const request = await createRequest.mutateAsync(body);

      const serviceNames = Object.fromEntries(
        x.services.map((serviceId) => {
          const service = services.find((item) => item.id === serviceId);

          return [serviceId, service?.name ?? serviceId];
        }),
      );

      saveSubmission({
        reference: request.reference,
        request: body,
        serviceNames,
      });

      router.push(
        account || x.createAccount
          ? `/dashboard/request-cleaning/success?ref=${request.reference}`
          : `/request-cleaning/success?ref=${request.reference}`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "We couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  });

  const preview =
    step === STEPS.length - 1 && v.environment
      ? buildPreview(getValues())
      : null;
  const activeServices = services?.filter((s) => s.active) ?? [];
  const last = STEPS.length - 1;

  return (
    <div ref={top} className="scroll-mt-20">
      <div className="mb-6">
        <div className="md:hidden">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-sm font-semibold text-primary">{STEPS[step]}</p>
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
          <Progress
            value={((step + 1) / STEPS.length) * 100}
            className="h-1.5 bg-muted"
            aria-label="Form progress"
          />
        </div>
        <ol className="hidden items-center md:flex" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="flex flex-1 items-center last:flex-none"
              aria-current={i === step ? "step" : undefined}
            >
              <UiButton
                type="button"
                variant="ghost"
                disabled={i > step}
                onClick={() => setStep(i)}
                className="h-auto gap-2 rounded-full p-0 hover:bg-transparent disabled:opacity-100"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    i < step && "border-emerald-500 bg-emerald-500 text-white",
                    i === step && "border-primary bg-primary text-white",
                    i > step && "border-border text-muted-foreground/70",
                  )}
                >
                  {i < step ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium xl:inline",
                    i === step
                      ? "text-foreground"
                      : i < step
                        ? "text-foreground/80"
                        : "text-muted-foreground/60",
                  )}
                >
                  {s}
                </span>
              </UiButton>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    i < step ? "bg-emerald-500" : "bg-gray-200",
                  )}
                />
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 hidden text-sm font-medium text-primary md:block xl:hidden">
          {STEPS[step]}
        </p>
      </div>

      <Card className="mb-28 lg:mb-6">
        <CardBody className="p-5 sm:p-8">
          <div key={step} className="animate-fade-in">
            {step === 0 && (
              <Section
                title="What type of environment needs cleaning?"
                desc="This helps us ask the right questions and send the right team."
              >
                {account && !!previous?.length && (
                  <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <Select
                      label="Start from a previous request"
                      placeholder="Choose a request to copy details from (optional)"
                      onChange={(e) => e.target.value && reuse(e.target.value)}
                      options={previous.map((r) => ({
                        value: r.id,
                        label: `${r.id}: ${r.services.join(", ")} (${environmentLabel[r.environment]})`,
                      }))}
                    />
                  </div>
                )}
                <RadioGroup
                  aria-label="Environment"
                  value={v.environment ?? ""}
                  onValueChange={(val) => {
                    if (val !== v.environment) setValue("services", []);
                    setValue(
                      "environment",
                      val as WizardValues["environment"],
                      { shouldValidate: true },
                    );
                  }}
                  className="grid grid-cols-2 gap-3 md:grid-cols-4"
                >
                  {ENVIRONMENTS.map((e) => {
                    const M = envMeta[e];
                    const on = v.environment === e;
                    return (
                      <RadioCard
                        key={e}
                        value={e}
                        className="relative flex flex-col items-start gap-3 rounded-xl p-4"
                        itemClassName="absolute right-3 top-3 ml-0"
                      >
                        <span
                          className={cn(
                            "flex size-10 items-center justify-center rounded-lg",
                            on
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-primary",
                          )}
                        >
                          <M.icon className="size-5" />
                        </span>
                        <span>
                          <span className="block text-[15px] font-semibold text-foreground">
                            {environmentLabel[e]}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                            {M.hint}
                          </span>
                        </span>
                      </RadioCard>
                    );
                  })}
                </RadioGroup>
                {err("environment") && (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    {err("environment")}
                  </p>
                )}
              </Section>
            )}

            {step === 1 && (
              <Section
                title="Which services do you need?"
                desc="Choose one or more. Final pricing comes from your quotation, not from this selection."
              >
                {!services ? (
                  <div className="space-y-3">
                    {[0, 1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : (
                  <Controller
                    control={control}
                    name="services"
                    render={({ field }) => (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activeServices.map((s) => {
                          const on = field.value.includes(s.id);
                          const rec = recommended[v.environment]?.includes(
                            s.id,
                          );
                          return (
                            <CheckboxCard
                              key={s.id}
                              checked={on}
                              onCheckedChange={() =>
                                field.onChange(
                                  on
                                    ? field.value.filter((x) => x !== s.id)
                                    : [...field.value, s.id],
                                )
                              }
                              className="flex gap-3.5 rounded-xl p-4"
                            >
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-foreground">
                                  {s.name}
                                  {rec && <Badge tone="info">Suggested</Badge>}
                                </span>
                                <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                                  {s.description}
                                </span>
                              </span>
                            </CheckboxCard>
                          );
                        })}
                      </div>
                    )}
                  />
                )}
                {err("services") && (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    {err("services")}
                  </p>
                )}
              </Section>
            )}

            {step === 2 && (
              <Section
                title={
                  residential
                    ? "Tell us about your home"
                    : "Tell us about the space"
                }
                desc="Approximate answers are fine. We confirm details during review or inspection."
              >
                {residential ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Bedrooms"
                      required
                      placeholder="Select"
                      options={count(10, true)}
                      error={err("bedrooms")}
                      {...reg("bedrooms")}
                    />
                    <Select
                      label="Bathrooms"
                      required
                      placeholder="Select"
                      options={count(10)}
                      error={err("bathrooms")}
                      {...reg("bathrooms")}
                    />
                    <Select
                      label="Living rooms"
                      placeholder="Select"
                      options={count(5, true)}
                      {...reg("livingRooms")}
                    />
                    <Select
                      label="Floors"
                      placeholder="Select"
                      options={count(5)}
                      {...reg("floors")}
                    />
                    <Select
                      label="Kitchens"
                      placeholder="Select"
                      options={count(3, true)}
                      {...reg("kitchens")}
                    />
                    <Select
                      label="Approximate size"
                      placeholder="Select"
                      options={sizes}
                      {...reg("size")}
                    />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Number of rooms"
                      required
                      placeholder="Select"
                      options={count(30)}
                      error={err("rooms")}
                      {...reg("rooms")}
                    />
                    <Select
                      label="Floors"
                      placeholder="Select"
                      options={count(10)}
                      {...reg("floors")}
                    />
                    <Input
                      label="Approximate size (sqm)"
                      required
                      inputMode="numeric"
                      placeholder="e.g. 180"
                      error={err("size")}
                      {...reg("size")}
                    />
                    <Select
                      label="Number of bathrooms"
                      placeholder="Select"
                      options={count(20, true)}
                      {...reg("bathrooms")}
                    />
                    <Textarea
                      wrapperClassName="sm:col-span-2"
                      label="Additional areas"
                      rows={3}
                      placeholder="Stairwells, rooftop, parking, cold room, stage…"
                      {...reg("additional")}
                    />
                  </div>
                )}
              </Section>
            )}

            {step === 3 && (
              <Section
                title="Describe the cleaning job"
                desc="The more detail and photos you give, the more accurate your quote."
              >
                <div className="space-y-5">
                  <Textarea
                    label="Description"
                    required
                    placeholder="e.g. Three-bedroom flat, not deep cleaned in over a year. Kitchen grease is the main concern."
                    error={err("description")}
                    {...reg("description")}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Textarea
                      label="Additional requirements"
                      rows={3}
                      placeholder="Allergies, fragrance-free products, access rules…"
                      {...reg("specialRequirements")}
                    />
                    <Textarea
                      label="Areas needing special attention"
                      rows={3}
                      placeholder="Oven, grout, stained rug…"
                      {...reg("attentionAreas")}
                    />
                  </div>
                  <FileUploader
                    label="Photos of the space (optional but helpful)"
                    value={photos}
                    onChange={setPhotos}
                    max={8}
                  />
                </div>
              </Section>
            )}

            {step === 4 && (
              <Section
                title="Where should we clean?"
                desc="We'll use this to plan travel and confirm that we cover your area."
              >
                {account && !!me?.addresses.length && (
                  <div className="mb-5">
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Use a saved address
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {me.addresses.map((a) => (
                        <UiButton
                          key={a.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-auto rounded-full px-3.5 py-1.5 font-normal hover:bg-brand-50"
                          onClick={() => {
                            setValue("address", a.address, {
                              shouldValidate: true,
                            });
                            setValue("area", a.area, { shouldValidate: true });
                            setValue("city", a.city, { shouldValidate: true });
                          }}
                        >
                          <MapPin className="text-blue-700" />
                          {a.label}
                        </UiButton>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    wrapperClassName="sm:col-span-2"
                    label="Street address"
                    required
                    autoComplete="street-address"
                    error={err("address")}
                    {...reg("address")}
                  />
                  <Input
                    label="Area"
                    required
                    placeholder="e.g. Trans-Amadi"
                    error={err("area")}
                    {...reg("area")}
                  />
                  <Select
                    label="State"
                    required
                    disabled
                    options={[
                      {
                        value: "Rivers State",
                        label: "Rivers State",
                      },
                    ]}
                    {...reg("state")}
                  />

                  <Select
                    label="Country"
                    required
                    disabled
                    options={[
                      {
                        value: "Nigeria",
                        label: "Nigeria",
                      },
                    ]}
                    {...reg("country")}
                  />

                  <Input
                    label="City"
                    required
                    error={err("city")}
                    {...reg("city")}
                  />
                  <Input
                    wrapperClassName="sm:col-span-2"
                    label="Nearest landmark"
                    placeholder="e.g. Opposite Mr Biggs"
                    {...reg("landmark")}
                  />
                  <Textarea
                    wrapperClassName="sm:col-span-2"
                    label="Additional location instructions"
                    rows={2}
                    placeholder="Gate colour, security contact, parking instructions…"
                    {...reg("directions")}
                  />
                </div>
                <div
                  className="mt-5 flex h-40 items-center justify-center rounded-xl border border-border bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:28px_28px] bg-muted/40"
                  role="img"
                  aria-label="Map preview placeholder"
                >
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm ring-1 ring-gray-200">
                    <MapPin className="h-4 w-4 text-blue-700" />
                    Map pin selection coming soon
                  </span>
                </div>
              </Section>
            )}

            {step === 5 && (
              <Section title="When would you like us to come?" desc="">
                <Alert variant="info" className="mb-5">
                  <Info />
                  <AlertDescription className="text-blue-900">
                    <p>
                      This is your <strong>preferred</strong> schedule, not a
                      booking. Our team confirms the final date and time after
                      you accept a quote.
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DateField
                    control={control}
                    name="date"
                    label="Preferred date"
                    required
                    min={MIN_DATE}
                    error={err("date")}
                  />
                  <TimePicker
                    label="Preferred time"
                    required
                    error={err("time")}
                    {...reg("time")}
                  />
                  <DateField
                    control={control}
                    name="altDate"
                    label="Alternative date"
                    min={MIN_DATE}
                    hint="Optional. Helps us fit you in."
                    error={err("altDate")}
                  />
                  <TimePicker label="Alternative time" {...reg("altTime")} />
                </div>
                <CheckboxField
                  control={control}
                  name="flexible"
                  className="mt-5"
                  label={
                    <>
                      <span className="font-medium text-foreground">
                        I&apos;m flexible on date and time.
                      </span>{" "}
                      <span className="text-muted-foreground">
                        We&apos;ll offer the best available slot near your
                        preference.
                      </span>
                    </>
                  }
                />
              </Section>
            )}

            {step === 6 && (
              <Section
                title="How can we reach you?"
                desc={
                  account
                    ? "From your profile. Change them if this request is for someone else."
                    : "We'll send updates about your request and your quotation here. No account needed."
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    wrapperClassName="sm:col-span-2"
                    label="Full name"
                    required
                    autoComplete="name"
                    error={err("contactName")}
                    {...reg("contactName")}
                  />
                  <Input
                    label="Phone number"
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="0803 123 4567"
                    error={err("contactPhone")}
                    {...reg("contactPhone")}
                  />
                  <Input
                    label="Email address"
                    required
                    type="email"
                    autoComplete="email"
                    error={err("contactEmail")}
                    {...reg("contactEmail")}
                  />
                </div>
                <div className="mt-5">
                  <CheckboxField
                    control={control}
                    name="consent"
                    label="I agree that Cleanin may contact me by phone, email or SMS about this request."
                  />
                  {err("consent") && (
                    <p role="alert" className="mt-1.5 text-sm text-destructive">
                      {err("consent")}
                    </p>
                  )}
                </div>
                {!account && (
                  <div className="mt-5 space-y-4 rounded-lg bg-muted/40 p-4">
                    <CheckboxField
                      control={control}
                      name="createAccount"
                      label={
                        <>
                          <span className="font-medium text-foreground">
                            Create an account instead of checking out as a guest
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground">
                            Save this request to your account and manage quotes and bookings after signing in.
                          </span>
                        </>
                      }
                    />
                    {v.createAccount && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Create password"
                          type="password"
                          autoComplete="new-password"
                          hint="At least 8 characters, with an uppercase letter and a number."
                          error={err("accountPassword")}
                          {...reg("accountPassword")}
                        />
                        <Input
                          label="Confirm password"
                          type="password"
                          autoComplete="new-password"
                          error={err("accountPasswordConfirm")}
                          {...reg("accountPasswordConfirm")}
                        />
                      </div>
                    )}
                    {!v.createAccount && (
                      <p className="text-sm text-muted-foreground">
                        You can continue as a guest. We&apos;ll notify you when your quote is ready, and you can verify your email or phone to view it.
                      </p>
                    )}
                  </div>
                )}
              </Section>
            )}

            {step === last && preview && (
              <Section title="Review your request" desc="">
                <Alert variant="warning" className="mb-6">
                  <Info />
                  <AlertDescription className="text-amber-900">
                    <p>
                      <strong>Submitting does not confirm a booking.</strong>{" "}
                      Our team will review your requirements, may inspect the
                      space, and send you a quotation. You only pay after you
                      accept it.
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="divide-y divide-border">
                  <Review
                    title="Environment and services"
                    onEdit={() => setStep(0)}
                  >
                    <p className="mb-2 font-medium text-foreground">
                      {environmentLabel[preview.environment]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {preview.services.map((s) => (
                        <Badge key={s} tone="info">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </Review>
                  <Review title="Property details" onEdit={() => setStep(2)}>
                    <DetailList
                      cols={3}
                      items={propertyItems(preview.property)}
                    />
                  </Review>
                  <Review
                    title="Cleaning requirements"
                    onEdit={() => setStep(3)}
                  >
                    <DetailList
                      cols={1}
                      items={[
                        { label: "Description", value: preview.description },
                        {
                          label: "Additional requirements",
                          value: preview.specialRequirements,
                        },
                        {
                          label: "Areas needing attention",
                          value: preview.attentionAreas,
                        },
                      ]}
                    />
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Photos ({preview.photos.length})
                      </p>
                      <PhotoGrid photos={preview.photos} alt="Uploaded photo" />
                    </div>
                  </Review>
                  <Review title="Location" onEdit={() => setStep(4)}>
                    <p className="text-foreground">
                      {preview.location.address}
                    </p>
                    <p className="text-muted-foreground">
                      {preview.location.area}, {preview.location.city}
                    </p>
                    {preview.location.landmark && (
                      <p className="text-sm text-muted-foreground">
                        Landmark: {preview.location.landmark}
                      </p>
                    )}
                    {preview.location.directions && (
                      <p className="text-sm text-muted-foreground">
                        {preview.location.directions}
                      </p>
                    )}
                  </Review>
                  <Review title="Preferred schedule" onEdit={() => setStep(5)}>
                    <p className="text-foreground">
                      {fmtLong(preview.preferred.date)},{" "}
                      {fmtTime(preview.preferred.time)}
                    </p>
                    {preview.preferred.altDate && (
                      <p className="text-sm text-muted-foreground">
                        Alternative: {fmtLong(preview.preferred.altDate)}
                        {preview.preferred.altTime
                          ? `, ${fmtTime(preview.preferred.altTime)}`
                          : ""}
                      </p>
                    )}
                    {preview.preferred.flexible && (
                      <Badge tone="info" className="mt-2">
                        Flexible on date and time
                      </Badge>
                    )}
                  </Review>
                  <Review title="Your details" onEdit={() => setStep(6)}>
                    <p className="text-foreground">{preview.contact.name}</p>
                    <p className="text-muted-foreground">
                      {preview.contact.phone}
                    </p>
                    <p className="text-muted-foreground">
                      {preview.contact.email}
                    </p>
                  </Review>
                </div>
              </Section>
            )}
          </div>
        </CardBody>
      </Card>

      <div
        className={cn(
          "fixed inset-x-0 z-20 border-t border-border bg-white p-3 lg:static lg:border-0 lg:bg-transparent lg:p-0",
          account
            ? "bottom-16"
            : "bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              step === 0
                ? router.push(account ? "/dashboard" : "/")
                : setStep(step - 1)
            }
            disabled={submitting}
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < last ? (
            <Button size="lg" onClick={next} className="flex-1 sm:flex-none">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={submit}
              loading={createRequest.isPending}
              className="flex-1 sm:flex-none"
            >
              <Send className="h-4 w-4" />
              Submit cleaning request
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

const Section = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <section>
    <h2 className="text-xl font-bold text-primary sm:text-2xl">{title}</h2>
    {desc ? (
      <p className="mb-6 mt-1.5 max-w-xl text-muted-foreground">{desc}</p>
    ) : (
      <div className="mb-6" />
    )}
    {children}
  </section>
);
const Review = ({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) => (
  <div className="py-5 first:pt-0 last:pb-0">
    <div className="mb-2.5 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <UiButton
        type="button"
        variant="link"
        size="sm"
        className="h-auto p-0"
        onClick={onEdit}
      >
        Edit
      </UiButton>
    </div>
    <div className="text-[15px]">{children}</div>
  </div>
);
