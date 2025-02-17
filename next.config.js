/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        port: '',
        pathname: '/file/anilistcdn/media/manga/cover/**',
      },
      {
        protocol: 'https',
        hostname: 'media.kitsu.app',
        port: '',
        pathname: '/manga/**',
      },
      {
        protocol: 'https',
        hostname: 'media.kitsu.io',
        port: '',
        pathname: '/manga/**',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
