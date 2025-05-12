// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove distDir and basePath - these are mainly for static exports
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    // Change this if not doing static export
    domains: ['localhost'] // Add any domains you're loading images from
  },
};

module.exports = nextConfig;