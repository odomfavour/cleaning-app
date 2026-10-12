"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/kit/Button";
import { Input } from "@/components/kit/Field";
import { apiClient } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";

const schema = z.object({
  password: z.string().min(8, "Use at least 8 characters").max(128).regex(/[A-Z]/, "Include an uppercase letter").regex(/\d/, "Include a number"),
  confirmation: z.string(),
}).refine((value) => value.password === value.confirmation, { path: ["confirmation"], message: "Passwords must match" });

function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return <div className="space-y-5"><p>This reset link is invalid. Please request a new one.</p><Button href="/forgot-password">Request reset link</Button></div>;
  if (done) return <div className="space-y-5" role="status"><h1 className="text-2xl font-bold text-primary">Password updated</h1><p>You can now sign in with your new password.</p><Button href="/login" full>Back to login</Button></div>;
  return <>
    <h1 className="text-3xl font-bold text-primary">Choose a new password</h1>
    <p className="mt-2 text-muted-foreground">Use at least 8 characters, one uppercase letter and one number.</p>
    <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(async ({ password }) => {
      setError("");
      try { await apiClient.post("/auth/reset-password", { token, password }); setDone(true); }
      catch (failure) { setError(getApiErrorMessage(failure, "Unable to reset password.")); }
    })}>
      <Input label="New password" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
      <Input label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmation?.message} {...register("confirmation")} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" full loading={isSubmitting}>Reset password</Button>
      <Button href="/forgot-password" variant="ghost" full>Request a new reset link</Button>
    </form>
  </>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<p>Loading…</p>}><ResetPasswordForm /></Suspense>;
}
