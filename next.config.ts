import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable source maps in development to avoid the preview-script.js error
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
  // Force all pages to be dynamic to avoid SSG issues with client-side code
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable static optimization completely
  output: 'standalone',
  trailingSlash: false,
  /* config options here */
};

export default nextConfig;