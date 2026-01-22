const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@restaurant-pos/ui',
    '@restaurant-pos/types',
    '@restaurant-pos/api-client',
    '@restaurant-pos/pwa-core'
  ]
}

module.exports = withPWA(nextConfig)

