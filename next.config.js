/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    unoptimized: true,
  },
  // Suppress hydration warnings in dev
  reactStrictMode: false,
};

module.exports = nextConfig;
