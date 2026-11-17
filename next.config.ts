import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: { position: "bottom-right" },
  experimental: {
    authInterrupts: true,
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
