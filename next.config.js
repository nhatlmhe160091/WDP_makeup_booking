/** @type {import('next').NextConfig} */
const nextConfig = {
  // async redirects() {
  //   return [
  //     {
  //       source: '/makeup-artists/:path*',
  //       destination: '/makeup-artists/:path*',
  //       permanent: false,
  //     },
  //   ];
  // },
    eslint: {
    ignoreDuringBuilds: true, //Cho phép build dù có warning
  },
};

module.exports = nextConfig;


