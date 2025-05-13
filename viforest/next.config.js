// const withPWA = require('next-pwa')({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
// });

// this was working -.-
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Remove distDir and basePath - these are mainly for static exports
//   trailingSlash: true,
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: { 
//     // Change this if not doing static export
//     domains: ['localhost'] // Add any domains you're loading images from
//   },
// };

// filepath: /Users/woffles/Desktop/viwoods-api/viforest/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Crucial for Tauri
  images: {
    unoptimized: true, // Required for next export with next/image
  },
  trailingSlash: true, // Often helpful for static sites
};

module.exports = nextConfig;