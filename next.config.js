const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 13+
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
  },
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
