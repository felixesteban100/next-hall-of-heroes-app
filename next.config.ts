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
  cacheComponents: true,
  allowedDevOrigins: ['192.168.1.156']
};

export default nextConfig;
