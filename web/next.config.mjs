/** @type {import('next').NextConfig} */
// Cache Bust 30: Deployment Trigger for Clean Build (Syntax Fix)
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
