/** @type {import('next').NextConfig} */
// Cache Bust 25: Deployment Trigger for History Page Sync Fix
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
