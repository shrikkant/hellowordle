import type { NextConfig } from 'next';

// Server-side base URL of the NestJS API. In Docker Compose this is the
// internal service address; in local dev it's the locally running server.
const API_URL = process.env.INTERNAL_API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
