/** @type {import('next').NextConfig} */
// Cache Bust 31: Deployment Trigger for Aggressive Sync (No Filter, Fresh Channel)
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
