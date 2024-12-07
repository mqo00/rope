/** @type {import('next').NextConfig} */
const nextConfig = {

  eslint: {
    // Ignore ESLint validation during build
    ignoreDuringBuilds: true,

  },
  typescript: {
    // Ignore TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
