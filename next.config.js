/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    NEXT_PUBLIC_APP_NAME: 'Felena Theory',
    NEXT_PUBLIC_APP_URL: 'https://www.FelenaTheory.com',
  },

  images: {
    domains: [
      'kmalqsuhphgfngizt.supabase.co',     // Supabase storage
      'cdn.felenatheory.com',              // Optional hosted CDN
      'avatars.githubusercontent.com',     // GitHub avatars
      'images.unsplash.com',               // Stock imagery
    ],
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;