/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/makeup-artists/:path*',
        destination: '/makeup-artists/:path*',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;


