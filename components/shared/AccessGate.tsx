"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hooks";
import { PageSkeleton } from "@/components/kit/Page";
import { VerifyAccess } from "./VerifyAccess";

/** Renders children only if this browser has a session for `customerId`; otherwise asks the guest to verify or sign in. */
export function AccessGate({ customerId, reference, title, intro, onGranted, children }: { customerId: string; reference: string; title?: string; intro?: string; onGranted?: () => void; children?: React.ReactNode }) {
  const path = usePathname();
  const [, bump] = useState(0);
  const allowed = api.session.canAccess(customerId);
  const { data } = useApi(() => (allowed ? Promise.resolve(null) : api.access.getPublicStatus(reference)), [allowed, reference]);
  if (allowed) return <>{children}</>;
  if (!data) return <PageSkeleton />;
  return (
    <div className="py-4">
      <VerifyAccess reference={reference} maskedEmail={data.maskedEmail} maskedPhone={data.maskedPhone} onVerified={() => { bump((n) => n + 1); onGranted?.(); }} title={title ?? "Verify to continue"} intro={intro} nextHref={path} />
    </div>
  );
}
