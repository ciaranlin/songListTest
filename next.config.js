/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: avoid 308 redirect (/api/getSongs -> /api/getSongs/)
  trailingSlash: false,

  images: {
    loader: "custom",
  },
};

module.exports = nextConfig;
