import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Simplest to ensure Supabase Storage images load without domain config
    unoptimized: true,
  },
};

export default nextConfig;
