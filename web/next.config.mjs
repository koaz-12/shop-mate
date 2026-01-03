/** @type {import('next').NextConfig} */
// Cache Bust 19: Deployment Trigger for Connection Indicator
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
