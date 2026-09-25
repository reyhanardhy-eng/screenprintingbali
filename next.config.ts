import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/ADMIN",
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
