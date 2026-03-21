import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API calls to backend in dev (avoids CORS issues)
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
