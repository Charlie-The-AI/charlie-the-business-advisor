/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@charlie/advisor-react', '@charlie/advisor-types', '@charlie/analytics-core'],
};

export default nextConfig;
