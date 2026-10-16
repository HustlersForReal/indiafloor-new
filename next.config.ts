import type { NextConfig } from "next";

// Static export — Cloudflare Pages (Wrangler) serves the `out/` folder as plain
// static assets, so the app must build to static HTML/CSS/JS with no Node
// server.
//
// Implications of `output: "export"` that shape this config:
//   - `headers()` and `middleware` are unsupported → security headers live in
//     public/_headers (Cloudflare-native), not here.
//   - Dynamic Route Handlers are unsupported → /api/referral is a static
//     JSON stub and the cookie anchor is written client-side.
//   - The default image optimizer needs a Node server → images.unoptimized.
//   - This is a single-page site (one `/` route, all in-page anchors), so
//     Partial Prerendering / Cache Components add no value here and are
//     disabled to keep the static export build unambiguous.
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // phone testing over LAN — blocks Next HMR from unknown origins otherwise
  allowedDevOrigins: ["192.168.1.189"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
