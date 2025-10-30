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
    domains: [
      'media6.ppl-media.com',
       'res.cloudinary.com',
    'imgur.com',
      // add more domains here if needed
    ],
  },
};

module.exports = nextConfig;


