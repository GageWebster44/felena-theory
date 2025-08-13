/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Public env used across the app
  env: {
    NEXT_PUBLIC_APP_NAME: 'Felena Theory',
    NEXT_PUBLIC_APP_URL: 'https://www.felenatheory.com',
  },

  // Allow images from the services you use
  images: {
    domains: [
      // Supabase storage (adjust to your actual project ref if different)
      'kmalqsuphpgfngizt.supabase.co',
      // Optional CDN you mentioned
      'cdn.felenatheory.com',
      // GitHub avatars
      'avatars.githubusercontent.com',
      // Stock imagery
      'images.unsplash.com',
    ],
  },

  // Simple redirects so people don't hit a non-route like /index
  async redirects() {
    return [
      { source: '/index', destination: '/', permanent: false },
      { source: '/home', destination: '/', permanent: true },
    ];
  },

  // Baseline security headers (your middleware also hardens things)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;