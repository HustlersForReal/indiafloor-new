import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// CSP without nonces (the nonce approach requires forcing every page to
// dynamic rendering and is incompatible with Partial Prerendering, which this
// app enables). Inline styles/scripts are allowed; third-party origins used by
// the page (Firebase, Leaflet/Photon tiles, WhatsApp redirect, GA) are listed.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://photon.komoot.io https://*.firebasedatabase.app https://firestore.googleapis.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // phone testing over LAN — blocks Next HMR from unknown origins otherwise
  allowedDevOrigins: ["192.168.1.189"],
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
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
