export function photoPublicUrl(key: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string;
  return `${base}/storage/v1/object/public/photos/${encodeURIComponent(key)}`;
}


