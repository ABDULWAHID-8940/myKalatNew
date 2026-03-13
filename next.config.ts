import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Optionally restrict to specific path patterns
        // pathname: '/dxanwjjcg/**',
      },
    ],
  },
};



export default nextConfig;
