/** @type {import('next').NextConfig} */
// Cache Bust 15: Deployment Trigger for Scanner Fallback
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
