import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Next 16 requires an explicit allowlist; 40 is the reduced tier served
    // over a slow/data-saver connection (see useSlowConnection), 75 is default.
    qualities: [40, 75],
  },
};

export default nextConfig;
