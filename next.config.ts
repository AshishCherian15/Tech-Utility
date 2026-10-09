import type { NextConfig } from "next";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "https://*.supabase.co";
const supabaseWebSocketOrigin = supabaseOrigin.replace(/^https?:/, (scheme) =>
  scheme === "https:" ? "wss:" : "ws:"
);
const isProduction = process.env.NODE_ENV === "production";

// All AI provider endpoints used in /api/autofill/route.ts
const aiProviderOrigins = [
  "https://api.openai.com",
  "https://api.groq.com",
  "https://generativelanguage.googleapis.com",
  "https://api.anthropic.com",
  "https://openrouter.ai",
  "https://api.deepseek.com",
  "https://api.mistral.ai",
  "https://api.together.xyz",
  "https://api.fireworks.ai",
  "https://api.x.ai",
  "https://api.cerebras.ai",
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  `connect-src 'self' ${supabaseOrigin} ${supabaseWebSocketOrigin} ${aiProviderOrigins}`,
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  ...(process.env.NODE_ENV === "development"
    ? { allowedDevOrigins: ["127.0.0.1", "localhost"] }
    : {}),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains",
                },
              ]
            : []),
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
