/** @type {import('next').NextConfig} */
// Cache Bust 23: Deployment Trigger for Toaster Dependency
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
