export function photoPublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://jdrsmlnngkniwgwdrnok.supabase.co";
  
  // Remove 'photos/' prefix if it exists
  const cleanKey = key.startsWith('photos/') ? key.slice(7) : key;
  
  return `${base}/storage/v1/object/public/photos/${encodeURIComponent(cleanKey)}`;
}


