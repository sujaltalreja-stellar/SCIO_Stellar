/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/industries',
        destination: '/#industries',
        permanent: false,
      },
      {
        source: '/energy',
        destination: '/industries/energy',
        permanent: false,
      },
      {
        source: '/renewable-energy',
        destination: '/industries/renewable-energy',
        permanent: false,
      },
      {
        source: '/maritime',
        destination: '/industries/maritime',
        permanent: false,
      },
      {
        source: '/maritime-fleet',
        destination: '/industries/maritime-fleet',
        permanent: false,
      },
      {
        source: '/manufacturing',
        destination: '/industries/manufacturing',
        permanent: false,
      },
      {
        source: '/logistics',
        destination: '/industries/logistics',
        permanent: false,
      },
      {
        source: '/supply-chain',
        destination: '/industries/supply-chain',
        permanent: false,
      },
      {
        source: '/platform',
        destination: '/?launch=1',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/?launch=1',
        permanent: false,
      },
      {
        source: '/resources',
        destination: '/?view=resources',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

