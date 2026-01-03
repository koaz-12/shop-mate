/** @type {import('next').NextConfig} */
// Cache Bust 21: Deployment Trigger for Wallet Button Restoration
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
