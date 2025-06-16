import { NextConfig } from 'next'
import * as path from 'path'
import withMDX from '@next/mdx'

const withMDXEnhancer = withMDX({
  extension: /\.mdx?$/,
})

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/privacy-policy',
        headers: [
          {
            key: 'Cache-Control',
            value: 'max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
  eslint: {
    dirs: ['src'],
  },
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    SIGN_MESSAGE: process.env.SIGN_MESSAGE,
    SOLANA_RPC_NODE_ENDPOINT: process.env.SOLANA_RPC_NODE_ENDPOINT,
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  logging: {
    fetches: { fullUrl: true },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'gateway.irys.xyz',
      },
    ],
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    config.externals = [...(config.externals || []), 'pino-pretty', 'encoding']
    config.module.rules.push(
      {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.md$/,
        use: 'raw-loader',
      }
    )
    return config
  },
}

export default withMDXEnhancer(nextConfig)
