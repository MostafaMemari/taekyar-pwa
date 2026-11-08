// Uploads live in R2 under raw object keys (imageKey); the bucket's public base URL turns a key into a fetchable image.
export function imageUrlOf(key: string | null | undefined): string | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!key || !base) return null;
  return `${base.replace(/\/+$/, "")}/${key}`;
}
