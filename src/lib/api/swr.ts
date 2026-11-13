import { mutate } from "swr";
import { ApiError } from "@/lib/api/client";

// A 401 or 403 will not fix itself between retries, so only network faults, throttling and server faults are retried.
function shouldRetryOnError(error: unknown) {
  if (!(error instanceof ApiError) || error.status === undefined) return true;

  return error.status >= 500 || error.status === 429;
}

export const swrReadOptions = { revalidateOnFocus: false, shouldRetryOnError };

// SWR's filter mutate skips the $inf$-prefixed keys of infinite feeds, so those feeds subscribe here and
// revalidateResource notifies them directly. Listeners may return their refetch promise so callers that
// await revalidateResource also wait for the feeds, keeping toasts and sheets behind fresh data.
const resourceListeners = new Map<string, Set<() => unknown>>();

export function subscribeResource(resource: string, listener: () => unknown): () => void {
  let listeners = resourceListeners.get(resource);
  if (!listeners) {
    listeners = new Set();
    resourceListeners.set(resource, listeners);
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function revalidateResource(resource: string) {
  await mutate((key) => Array.isArray(key) && key[0] === resource);
  await Promise.all([...(resourceListeners.get(resource) ?? [])].map((listener) => listener()));
}
