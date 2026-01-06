/** @type {import('next').NextConfig} */
// Cache Bust 36: UI Polish - Preemptive Add Item Status
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
