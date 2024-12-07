/** @type {import('next').NextConfig} */
const nextConfig = {

  eslint: {
    // 在构建时忽略 ESLint 校验
    ignoreDuringBuilds: true,

  },
  typescript: {
    // 忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
