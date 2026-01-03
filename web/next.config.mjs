/** @type {import('next').NextConfig} */
// Cache Bust 14: Deployment Trigger for Final Sync Fix (Permissions V2)
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
