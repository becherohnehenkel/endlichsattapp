import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp lädt ein natives Binary (libvips) je Plattform — muss vom Bundler unangetastet
  // bleiben, sonst versucht Turbopack es zu bundlen und findet zur Laufzeit auf Vercels
  // Linux-Runtime das falsche/kein Binary (ERR_DLOPEN_FAILED). Offizieller Next.js-Fix
  // für native-Binary-Pakete in Server-Routen.
  serverExternalPackages: ['sharp'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/rezepte', destination: '/ernaehrung/rezepte', permanent: true },
      { source: '/saettigungsmatrix', destination: '/ernaehrung/saettigungsmatrix', permanent: true },
      { source: '/wie-esse-ich-richtig', destination: '/ernaehrung/wie-esse-ich-richtig', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
};

export default nextConfig;
