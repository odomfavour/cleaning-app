"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RequestSuccess } from "@/components/shared/RequestSuccess";

function Inner() {
  return (
    <RequestSuccess
      reference={useSearchParams().get("ref") ?? ""}
      variant="public"
    />
  );
}
export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
