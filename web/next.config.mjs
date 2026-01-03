/** @type {import('next').NextConfig} */
// Cache Bust 16: Deployment Trigger for Barcode Memory Logic
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
