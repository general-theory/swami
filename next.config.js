/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['a.espncdn.com'],
  },
  output: 'standalone',
  experimental: {
    // Disable prerendering for pages that might cause issues
    workerThreads: false,
    cpus: 1
  }
}

module.exports = nextConfig 