import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

// Port 8080 is the default Dify Nginx proxy port exposing backend endpoints
const DIFY_BACKEND_URL = process.env.DIFY_BACKEND_URL ?? 'http://localhost:8080';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  basePath: BASE_PATH || undefined,
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'clerk.com',
        port: ''
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/console/api/:path*',
        destination: `${DIFY_BACKEND_URL}/console/api/:path*`
      },
      {
        source: '/api/:path*',
        destination: `${DIFY_BACKEND_URL}/api/:path*`
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/signin',
        permanent: true
      },
      {
        source: '/sign-up',
        destination: '/signup',
        permanent: true
      },
      {
        source: '/auth/sign-in',
        destination: '/signin',
        permanent: true
      },
      {
        source: '/auth/signin',
        destination: '/signin',
        permanent: true
      },
      {
        source: '/auth/sign-up',
        destination: '/signup',
        permanent: true
      },
      {
        source: '/auth/signup',
        destination: '/signup',
        permanent: true
      },
      {
        source: '/auth/forgot-password',
        destination: '/forgot-password',
        permanent: false
      },
      {
        source: '/auth/reset-password',
        destination: '/reset-password',
        permanent: false
      },
      {
        source: '/auth/otp',
        destination: '/otp',
        permanent: false
      }
    ];
  },
  transpilePackages: ['geist'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  experimental: {
    agentUpgrade: 'security'
  }
};

let configWithPlugins = baseConfig;

// Conditionally enable Sentry configuration
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED && (process.env.NEXT_PUBLIC_SENTRY_ORG || process.env.NEXT_PUBLIC_SENTRY_PROJECT)) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    telemetry: false,
    reactComponentAnnotation: {
      enabled: true
    },
    bundleSizeOptimizations: {
      excludeDebugStatements: true
    },
    sourcemaps: {
      disable: !process.env.NEXT_PUBLIC_SENTRY_ORG || !process.env.NEXT_PUBLIC_SENTRY_PROJECT
    }
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
