/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '../static/react',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
