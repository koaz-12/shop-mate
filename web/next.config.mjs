/** @type {import('next').NextConfig} */
// Cache Bust 7: Deployment Trigger for History Page Fix build refresh (Cache Bust 2)
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
