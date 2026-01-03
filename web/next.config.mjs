/** @type {import('next').NextConfig} */
// Cache Bust 20: Deployment Trigger for Syntax Fix in Header
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
