// @ts-nocheck
import type { NextConfig } from 'next';

// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
// });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ncueapdxkkvhbdrqxguy.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
  },
  // turbopack: {}, // Removed
  serverExternalPackages: ['opik'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Empty
  }
};

export default nextConfig; // withPWA(nextConfig);
