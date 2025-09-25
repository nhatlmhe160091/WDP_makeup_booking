/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/chu-san/:path*',
        destination: '/makeup-artists/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;


