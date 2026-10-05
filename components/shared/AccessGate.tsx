"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useApi } from "@/lib/hooks";
import { PageSkeleton } from "@/components/kit/Page";
import { getPublicRequestStatus } from "@/lib/api/services/cleaning-request-tracking.service";
import { VerifyAccess } from "./VerifyAccess";

/** Renders children once verified; otherwise asks the guest to verify or sign in. */
export function AccessGate({
  reference,
  title,
  intro,
  onGranted,
  children,
}: {
  customerId?: string;
  reference: string;
  title?: string;
  intro?: string;
  onGranted?: () => void;
  children?: React.ReactNode;
}) {
  const path = usePathname();
  const [verified, setVerified] = useState(false);
  const { data } = useApi(
    () => (verified ? Promise.resolve(null) : getPublicRequestStatus(reference)),
    [verified, reference],
  );

  if (verified) return <>{children}</>;
  if (!data) return <PageSkeleton />;

  return (
    <div className="py-4">
      <VerifyAccess
        reference={reference}
        maskedEmail={data.maskedEmail}
        maskedPhone={data.maskedPhone}
        onVerified={() => {
          setVerified(true);
          onGranted?.();
        }}
        title={title ?? "Verify to continue"}
        intro={intro}
        nextHref={path}
      />
    </div>
  );
}

