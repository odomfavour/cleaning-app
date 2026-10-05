"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import Link from "next/link";
import { KeyRound, Mail, ShieldCheck, Smartphone } from "lucide-react";

import { RadioCard, RadioGroup } from "@/components/kit/Choice";
import { Button as UiButton } from "@/components/ui/button";
import { Button } from "@/components/kit/Button";
import { Card, CardBody } from "@/components/kit/Card";
import { Input } from "@/components/kit/Field";
import { FormAlert } from "@/components/shared/AuthParts";
import {
  sendRequestAccessCode,
  verifyRequestAccess,
} from "@/lib/api/services/request-access.service";

type VerifyAccessProps = {
  reference: string;
  maskedEmail: string;
  maskedPhone: string;
  onVerified: () => void;
  title?: string;
  intro?: string;
  nextHref?: string;
};

export function VerifyAccess({
  reference,
  maskedEmail,
  maskedPhone,
  onVerified,
  title = "Verify it's you",
  intro,
  nextHref,
}: VerifyAccessProps) {
  const [channel, setChannel] = useState<"email" | "phone">("email");

  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await sendRequestAccessCode(reference, channel);

      setSentTo(response.sentTo);
      setCode("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Couldn't send the code.",
      );
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    const value = code.trim();

    if (value.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await verifyRequestAccess(reference, value);

      onVerified();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed.");

      setBusy(false);
    }
  };

  const changeMethod = () => {
    setSentTo(null);
    setCode("");
    setError(null);
  };

  const next = nextHref ? `?next=${encodeURIComponent(nextHref)}` : "";

  return (
    <Card className="mx-auto max-w-lg">
      <CardBody className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>

          <div>
            <h2 className="text-xl font-bold text-primary">{title}</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {intro ??
                "For your privacy, we confirm your identity before showing quotes, payments or booking details."}
            </p>
          </div>
        </div>

        {!sentTo ? (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Send a one-time code to
              </legend>

              <RadioGroup
                value={channel}
                onValueChange={(value) => setChannel(value as typeof channel)}
                className="grid gap-2.5 sm:grid-cols-2"
              >
                {(
                  [
                    ["email", Mail, maskedEmail],
                    ["phone", Smartphone, maskedPhone],
                  ] as const
                ).map(([key, Icon, hint]) => (
                  <RadioCard
                    key={key}
                    value={key}
                    className="flex items-center p-3"
                  >
                    <Icon className="size-4 shrink-0 text-primary" />

                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">
                        {key === "email" ? "Email" : "SMS"}
                      </span>

                      <span className="block truncate text-sm font-medium text-foreground">
                        {hint}
                      </span>
                    </span>
                  </RadioCard>
                ))}
              </RadioGroup>
            </fieldset>

            {error && <FormAlert message={error} />}

            <Button size="lg" full onClick={send} loading={busy}>
              Send code
            </Button>
          </>
        ) : (
          <>
            <Alert variant="success">
              <AlertDescription className="text-emerald-900">
                We sent a 6-digit code to <strong>{sentTo}</strong>. It expires
                in 10 minutes.
              </AlertDescription>
            </Alert>

            <Input
              label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              className="text-center text-lg tracking-[0.4em]"
              hint="Enter the 6-digit code we sent you."
            />

            {error && <FormAlert message={error} />}

            <Button size="lg" full onClick={verify} loading={busy}>
              <KeyRound className="h-4 w-4" />
              Verify and continue
            </Button>

            <div className="flex justify-between">
              <UiButton
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={changeMethod}
                disabled={busy}
              >
                Change method
              </UiButton>

              <UiButton
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={send}
                disabled={busy}
              >
                Resend code
              </UiButton>
            </div>
          </>
        )}

        <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/login${next}`}
            className="font-semibold text-blue-700 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
