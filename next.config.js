/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
    unoptimized: true,
  },
  reactStrictMode: false,
  // v2
};
module.exports = nextConfig;