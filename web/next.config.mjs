/** @type {import('next').NextConfig} */
// Cache Bust 33: Deployment Trigger for Debounced Connection (Stability Polish)
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
