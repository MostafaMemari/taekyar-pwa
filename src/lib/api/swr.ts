import { ApiError } from "@/lib/api/client";

// A 401 or 403 will not fix itself between retries, so only network faults, throttling and server faults are retried.
function shouldRetryOnError(error: unknown) {
  if (!(error instanceof ApiError) || error.status === undefined) return true;

  return error.status >= 500 || error.status === 429;
}

export const swrReadOptions = { revalidateOnFocus: false, shouldRetryOnError };
