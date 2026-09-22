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
        destination: '/?industry=energy&tab=energy-dashboard',
        permanent: false,
      },
      {
        source: '/renewable-energy',
        destination: '/?industry=energy&tab=energy-dashboard',
        permanent: false,
      },
      {
        source: '/maritime',
        destination: '/?industry=maritime&tab=dashboard',
        permanent: false,
      },
      {
        source: '/maritime-fleet',
        destination: '/?industry=maritime&tab=dashboard',
        permanent: false,
      },
      {
        source: '/manufacturing',
        destination: '/?industry=manufacturing&tab=dashboard',
        permanent: false,
      },
      {
        source: '/logistics',
        destination: '/?industry=logistics&tab=dashboard',
        permanent: false,
      },
      {
        source: '/supply-chain',
        destination: '/?industry=logistics&tab=dashboard',
        permanent: false,
      },
      {
        source: '/platform',
        destination: '/?industry=energy&tab=energy-dashboard',
        permanent: false,
      },
      {
        source: '/dashboard',
        destination: '/?industry=energy&tab=energy-dashboard',
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

