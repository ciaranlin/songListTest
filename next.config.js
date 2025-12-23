/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    loader: 'custom'
  },
  eslint: {
    // Keep builds from failing due to lint rules in older code.
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;
