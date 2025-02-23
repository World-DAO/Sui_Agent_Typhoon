/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://43.134.74.254:8080/api/:path*'
            },
            {
                source: '/mail/:path*',
                destination: 'https://ethernet-heath-tampa-runtime.trycloudflare.com/:path*'
            }
        ]
    }
}
module.exports = nextConfig 