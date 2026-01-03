/** @type {import('next').NextConfig} */
// Cache Bust 18: Deployment Trigger for Sync Restoration & UI Refresh
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
