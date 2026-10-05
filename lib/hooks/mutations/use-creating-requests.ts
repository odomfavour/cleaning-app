import { useMutation } from "@tanstack/react-query";

import type { CreateCleaningRequestInput } from "@/lib/validations/cleaning-request";
import { createCleaningRequest } from "@/lib/api/services/cleaning-request.service";

export function useCreateCleaningRequest() {
  return useMutation({
    mutationFn: (input: CreateCleaningRequestInput) =>
      createCleaningRequest(input),
  });
}
