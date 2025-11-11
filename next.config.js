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
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    // Fallback cho các domain cụ thể nếu cần
    domains: [
      'media6.ppl-media.com',
      'res.cloudinary.com',
      'imgur.com',
      'i.pinimg.com',
    ],
  },
};

module.exports = nextConfig;


