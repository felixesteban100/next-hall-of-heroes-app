import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Matches any hostname
        pathname: '**', // Matches any path
      },
    ],
  },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
