"use client";
import { Button as UiButton } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/kit/Button";
import { Input } from "@/components/kit/Field";
import { forgotPassword } from "@/lib/api/services/auth.service";

const schema = z.object({ email: z.string().min(1, "Enter your email address").email("Enter a valid email address") });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const onSubmit = async (v: Values) => { await forgotPassword(v.email); setSentTo(v.email); };

  if (sentTo) return (
    <div className="animate-pop-in text-center" role="status">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-700"><MailCheck className="h-8 w-8" /></div>
      <h1 className="text-2xl font-bold text-primary">Check your email</h1>
      <p className="mt-2 text-muted-foreground">If an account exists for <strong className="text-foreground">{sentTo}</strong>, we&apos;ve sent a link to reset your password. It expires in 30 minutes.</p>
      <div className="mt-7 space-y-3"><Button href="/login" size="lg" full>Back to login</Button>
        <UiButton variant="link" size="sm" className="h-auto p-0" onClick={() => setSentTo(null)}>Use a different email</UiButton></div>
    </div>
  );

  return (
    <>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" />Back to login</Link>
      <h1 className="text-3xl font-bold text-primary">Reset your password</h1>
      <p className="mt-2 text-muted-foreground">Enter the email you registered with and we&apos;ll send you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Button type="submit" size="lg" full loading={isSubmitting}>{isSubmitting ? "Sending…" : "Send reset link"}</Button>
      </form>
    </>
  );
}
