/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Local development
      { protocol: "http",  hostname: "localhost" },
      // Render-hosted API (static images served by .NET)
      { protocol: "https", hostname: "*.onrender.com" },
      // Supabase Storage
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

module.exports = nextConfig;
