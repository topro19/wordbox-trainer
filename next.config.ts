import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/wordbox-trainer",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
