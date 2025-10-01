import type { NextConfig } from "next";

const DEFAULT_SUPABASE_HOST = "emlqnkkjvbisqmuypjht.supabase.co";
const DEFAULT_SUPABASE_BUCKET = "food-posts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || DEFAULT_SUPABASE_BUCKET;

let supabaseHost: string | undefined;

if (supabaseUrl) {
  try {
    supabaseHost = new URL(supabaseUrl).hostname;
  } catch (error) {
    console.warn("Invalid NEXT_PUBLIC_SUPABASE_URL provided. Falling back to default host.", error);
  }
}

const allowedHosts = new Set<string>();

if (supabaseHost) {
  allowedHosts.add(supabaseHost);
} else {
  allowedHosts.add(DEFAULT_SUPABASE_HOST);
}

const nextConfig: NextConfig = {
  images: {
    domains: Array.from(allowedHosts),
    remotePatterns: Array.from(allowedHosts).map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: `/storage/v1/object/public/${supabaseBucket}/**`,
    })),
  },
};

export default nextConfig;
