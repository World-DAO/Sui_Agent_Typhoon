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
            }
        ]
    }
}
module.exports = nextConfig 