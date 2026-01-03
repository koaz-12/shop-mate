/** @type {import('next').NextConfig} */
// Cache Bust 27: Deployment Trigger for Final Sync Verification
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
