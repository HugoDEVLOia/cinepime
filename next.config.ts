
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cinepulse.lol',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'movix.blog',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'xalaflix.men',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
