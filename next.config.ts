import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
let images: NextConfig["images"] = { unoptimized: true };

if (supabaseUrl) {
  try {
    const { hostname, protocol } = new URL(supabaseUrl);
    images = {
      remotePatterns: [
        { protocol: protocol.replace(":", "") as "http" | "https", hostname, pathname: "/storage/v1/object/public/**" },
      ],
    };
  } catch {
    // keep unoptimized fallback
  }
}

const nextConfig: NextConfig = {
  images,
};

export default nextConfig;
