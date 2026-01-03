/** @type {import('next').NextConfig} */
// Redeploy trigger: Force Vercel build refresh
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
