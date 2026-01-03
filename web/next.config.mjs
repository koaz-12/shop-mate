/** @type {import('next').NextConfig} */
// Cache Bust 8: Deployment Trigger for History Delete Fix build refresh (Cache Bust 2)
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
