import type { NextConfig } from "next";

// CSP intentionally allows 'unsafe-inline' for script-src/style-src rather than a
// nonce-based policy: this app uses inline `style={{...}}` attributes pervasively
// (every accent-colored element) and layout.tsx has a deliberate inline <script> for
// the scroll-restoration fix (see CLAUDE.md) -- a strict nonce CSP would need that
// script threaded a per-request nonce via proxy.ts, which is real, separate work.
// Even with unsafe-inline, this still blocks loading any *new* remote script from an
// untrusted origin, restricts where the page can send data, and blocks clickjacking/
// plugin-based attacks -- meaningfully better than no policy, not the final state.
const SUPABASE_ORIGIN = "https://dlnbrjldscazjznkhoyc.supabase.co";

// Next/React's dev-mode Fast Refresh and stack-trace reconstruction use eval() --
// 'unsafe-eval' is only added outside production so dev mode isn't broken, and is
// never shipped to the deployed site.
const scriptSrc = `script-src 'self' 'unsafe-inline'${
  process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
}`;

const CSP = [
  `default-src 'self'`,
  scriptSrc,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${SUPABASE_ORIGIN}`,
  `media-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Forage Interview records the mic via MediaRecorder -- microphone=(self)
          // keeps that working while still denying camera/location by default.
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
