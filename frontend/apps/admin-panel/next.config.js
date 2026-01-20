/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@restaurant-pos/ui',
    '@restaurant-pos/types',
    '@restaurant-pos/api-client'
  ]
}

module.exports = nextConfig

