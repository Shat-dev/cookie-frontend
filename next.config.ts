import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cyan-cautious-hare-412.mypinata.cloud" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "nftstorage.link" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "dweb.link" },
      // Add playcookie.xyz domain for any images served from your domain
      { protocol: "https", hostname: "playcookie.xyz" },
      { protocol: "https", hostname: "api.playcookie.xyz" },
    ],
    unoptimized: true,
  },

  // Handle API routing based on environment
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Only add rewrites if we have an API URL configured
    if (!apiUrl) {
      return [];
    }

    return [
      {
        source: "/api/current-pool",
        destination: `${apiUrl}/api/current-pool`,
      },
      {
        source: "/api/current-projections",
        destination: `${apiUrl}/api/current-projections`,
      },
      {
        source: "/api/lottery/current-draw",
        destination: `${apiUrl}/api/lottery/current-draw`,
      },
      {
        source: "/api/prize-pool",
        destination: `${apiUrl}/api/prize-pool`,
      },
    ];
  },

  // Add headers for better CORS handling
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
