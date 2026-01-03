/** @type {import('next').NextConfig} */
// Cache Bust 32: Production Release (Sync & RLS Fixed)
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
