import { useSyncExternalStore } from "react";
import type { CreateCleaningRequestInput } from "@/lib/validations/cleaning-request";

/**
 * After submitting, we keep the summary in this browser tab only
 * (sessionStorage) so the success page can show it without exposing
 * request details to anyone who merely knows a reference.
 */
const KEY = "cleanin-last-submission";

export type Submission = {
  reference: string;
  request: CreateCleaningRequestInput;
  serviceNames: Record<string, string>;
};

export const saveSubmission = (s: Submission) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
};

export const readSubmission = (reference: string): Submission | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    const s = raw ? (JSON.parse(raw) as Submission) : null;

    return s && s.reference === reference ? s : null;
  } catch {
    return null;
  }
};

const subscribe = () => () => {};

/**
 * Hydration-safe read of the last submission for this tab
 * (null on the server and on mismatch).
 */
export function useSubmission(reference: string): Submission | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    () => null,
  );

  if (!raw) return null;

  try {
    const s = JSON.parse(raw) as Submission;

    return s.reference === reference ? s : null;
  } catch {
    return null;
  }
}
