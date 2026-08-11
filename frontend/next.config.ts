import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Django dev media server (local.py, FileSystemStorage-backed).
      { protocol: "http", hostname: "localhost", port: "8000" },
      // TODO: add Cloudinary's domain (e.g. res.cloudinary.com) once real
      // CLOUDINARY_URL credentials exist and next/image is adopted for
      // remote-hosted media (plain <img> is used for now, see ProjectCard/Gallery).
    ],
  },
};

export default nextConfig;
