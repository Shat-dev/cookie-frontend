import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cyan-cautious-hare-412.mypinata.cloud" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "nftstorage.link" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "dweb.link" },
      // Add playgacha.xyz domain for any images served from your domain
      { protocol: "https", hostname: "playgacha.xyz" },
      { protocol: "https", hostname: "api.playgacha.xyz" },
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
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
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
