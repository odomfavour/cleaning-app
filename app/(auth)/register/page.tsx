"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/kit/Button";
import { CheckboxField, Input } from "@/components/kit/Field";
import { FormAlert, SuccessPanel } from "@/components/shared/AuthParts";
import { getApiErrorMessage } from "@/lib/api/errors";
import { useRegisterCustomer } from "@/lib/hooks/queries/use-auth";

const schema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name"),
    lastName: z.string().trim().min(1, "Enter your last name"),
    email: z
      .string()
      .min(1, "Enter your email address")
      .email("Enter a valid email address"),
    phone: z
      .string()
      .min(1, "Enter your phone number")
      .regex(
        /^\+?[\d\s]{10,16}$/,
        "Enter a valid phone number, e.g. 0803 123 4567",
      ),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/\d/, "Include a number"),
    confirm: z.string().min(1, "Confirm your password"),
    terms: z.literal(true, { error: "Accept the terms to continue" }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });
type Values = z.infer<typeof schema>;

function RegisterForm() {
  const params = useSearchParams();
  const next = params.get("next");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const registerMutation = useRegisterCustomer();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: params.get("email") ?? "" },
  });

  const onSubmit = async (v: Values) => {
    setError(null);
    try {
      await registerMutation.mutateAsync({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phone: v.phone,
        password: v.password,
      });
      setDone(true);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  if (done)
    return (
      <SuccessPanel
        title="Your account is ready"
        action={
          <Button
            href={next?.startsWith("/") ? next : "/dashboard"}
            size="lg"
            full
          >
            Go to my dashboard
          </Button>
        }
      >
        <p>Welcome to Cleanin. You can now request your first cleaning.</p>
      </SuccessPanel>
    );

  return (
    <>
      <h1 className="text-3xl font-bold text-primary">Create your account</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your requests, quotes and bookings in one place. You don&apos;t
        need an account to{" "}
        <Link
          href="/request-cleaning"
          className="font-medium text-blue-700 hover:underline"
        >
          request a cleaning
        </Link>
        .
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-4"
      >
        {error && <FormAlert message={error} />}
        {error?.includes("previous guest request") && (
          <p className="text-sm text-muted-foreground">
            <Link
              href="/request"
              className="font-semibold text-blue-700 hover:underline"
            >
              Track and verify your request
            </Link>{" "}
            to create an account and keep its history.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            placeholder="Chiamaka"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            placeholder="Obi"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="0803 123 4567"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with an uppercase letter and a number."
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <div>
          <CheckboxField
            control={control}
            name="terms"
            label={
              <>
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-blue-700 hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-blue-700 hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </>
            }
          />
          {errors.terms && (
            <p role="alert" className="mt-1.5 text-sm text-destructive">
              {errors.terms.message}
            </p>
          )}
        </div>
        <Button type="submit" size="lg" full loading={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-700 hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
