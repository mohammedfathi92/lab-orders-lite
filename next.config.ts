import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Disable Next.js debug messages
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
