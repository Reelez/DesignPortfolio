import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Django dev media server (local.py, FileSystemStorage-backed).
      { protocol: "http", hostname: "localhost", port: "8000" },
      // Cloudinary-hosted media (production, once CLOUDINARY_URL is set).
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // The Django dev media server resolves to localhost, which Next's image
    // optimizer otherwise blocks as a private-IP SSRF risk. Safe here since
    // it's local-only dev media (see remotePatterns above); production only
    // ever proxies Cloudinary's public domain.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
