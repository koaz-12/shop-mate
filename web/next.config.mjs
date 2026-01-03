/** @type {import('next').NextConfig} */
// Cache Bust 26: Deployment Trigger for Store Duplicates and Toasts
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
