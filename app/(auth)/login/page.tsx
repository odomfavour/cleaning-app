"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/kit/Button";
import { CheckboxField, Input } from "@/components/kit/Field";
import { FormAlert } from "@/components/shared/AuthParts";
import { useLogin } from "@/lib/hooks/queries/use-auth";
import axios from "axios";

const schema = z.object({
  email: z
    .string()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),

  password: z.string().min(1, "Enter your password"),

  remember: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      remember: true,
    },
  });

  const onSubmit = async (values: Values) => {
    setError(null);

    try {
      const result = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      if (result.user.role === "customer" && next?.startsWith("/")) {
        router.push(next);
        return;
      }

      router.push(result.redirect);
    } catch (error) {
      console.error("Login failed:", error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        setError(
          typeof message === "string"
            ? message
            : "Unable to log in. Please try again.",
        );

        return;
      }

      setError(error instanceof Error ? error.message : "Login failed.");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-primary">Welcome back</h1>

      <p className="mt-2 text-muted-foreground">
        Log in to track your requests, quotes and bookings.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-5"
      >
        {error && <FormAlert message={error} />}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between">
          <CheckboxField
            control={control}
            name="remember"
            label="Remember me"
          />

          <Link
            href="/forgot-password"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" full loading={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Cleanin?{" "}
        <Link
          href="/register"
          className="font-semibold text-blue-700 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        Just need a cleaning?{" "}
        <Link
          href="/request-cleaning"
          className="font-semibold text-blue-700 hover:underline"
        >
          Request one without an account
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-muted-foreground">
        Have a request reference?{" "}
        <Link
          href="/request"
          className="font-semibold text-blue-700 hover:underline"
        >
          Track your request
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
