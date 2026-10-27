import { mutate } from "swr";

// Cached responses belong to the session that fetched them, so an identity change drops them instead of revalidating.
export function clearDataCache() {
  return mutate(() => true, undefined, { revalidate: false });
}
