// @ts-nocheck
import type { NextConfig } from 'next';

// next-pwa requires Webpack. For production, use: next build --experimental-webpack
// Development uses Turbopack by default, so we disable PWA in dev.
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

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
  // opik uses Node.js modules (fs, async_hooks) - must be server-only
  serverExternalPackages: ['opik'],
  typescript: {
    ignoreBuildErrors: true,
  },
  // Empty turbopack config to silence warnings when using Turbopack in dev
  turbopack: {},
  experimental: {
    // Empty
  }
};

export default withPWA(nextConfig);

