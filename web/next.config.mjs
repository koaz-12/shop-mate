/** @type {import('next').NextConfig} */
// Cache Bust 24: Deployment Trigger for Offline Sync Types Fix
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
