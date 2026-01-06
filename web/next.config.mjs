/** @type {import('next').NextConfig} */
// Cache Bust 37: Fix Restock All & Add Partial Restock
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
