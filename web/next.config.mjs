/** @type {import('next').NextConfig} */
// Cache Bust 17: Deployment Trigger for Bulk Actions Feature
const nextConfig = {
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
