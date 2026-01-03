/** @type {import('next').NextConfig} */
// Cache Bust 10: Deployment Trigger for Realtime Sync Fix build refresh (Cache Bust 2)
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
