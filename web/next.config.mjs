/** @type {import('next').NextConfig} */
// Cache Bust 34: Feature - Bought By + Smart Consumption (The Salami Fix)
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
