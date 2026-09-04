import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  /*
   * `next dev` listens on every interface, so a phone on the same Wi-Fi can
   * reach it — but Next blocks its own dev resources (HMR socket, the error
   * overlay) for any origin it was not started on, which is how testing on a
   * real device ends up with a page that renders once and then never
   * refreshes. The pattern matches per dot-separated segment, so this covers
   * the whole subnet and survives the router handing out a different address.
   *
   * Development only: `allowedDevOrigins` is not read by `next build`.
   */
  allowedDevOrigins: ["192.168.31.*", "192.168.1.*", "192.168.0.*", "10.0.0.*"],
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
