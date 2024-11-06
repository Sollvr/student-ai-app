import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  }
};

export default nextConfig;

