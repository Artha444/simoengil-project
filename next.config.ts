import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "p16-images-sign-sg.tokopedia-static.net",
      },
      {
        protocol: "https",
        hostname: "*.tokopedia-static.net",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "down-id.img.susercontent.com",
      }
    ],
  },
};

export default nextConfig;
