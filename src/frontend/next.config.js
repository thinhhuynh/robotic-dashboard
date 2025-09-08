/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd'],
  env: {
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || 'ws://localhost:8080',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig