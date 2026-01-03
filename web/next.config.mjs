/** @type {import('next').NextConfig} */
// Cache Bust 11: Deployment Trigger for Items Hook Fix build refresh (Cache Bust 2)
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
