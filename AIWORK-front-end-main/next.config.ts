import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./next-intl.config.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone" as "standalone" | "export" | undefined,
  // TODO:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  // Các config khác nếu có
  async rewrites() {
    return [
      // Case 1: Không có ngôn ngữ (vd: /mp/track)
      {
        source: '/mp/:path*',
        destination: 'https://api.mixpanel.com/:path*',
      },
      // Case 2: Có ngôn ngữ (vd: /en/mp/track, /vi/mp/track)
      {
        source: '/:locale/mp/:path*',
        destination: 'https://api.mixpanel.com/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
