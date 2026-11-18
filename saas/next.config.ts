import { env } from './src/env';
import './src/libs/Env';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

// Define the base Next.js configuration
const openapiLoader = { loader: '@dify/openapi-content-mapper/loader' };

const baseConfig: NextConfig = {
  agentRules: false,
  basePath: env.NEXT_PUBLIC_BASE_PATH,
  turbopack: {
    rules: {
      '*.openapi': { loaders: [openapiLoader], as: '*.js' },
      '*.openapi-source': { loaders: [openapiLoader], as: '*.js' },
      '*openapi-namespace.js': { loaders: [openapiLoader], as: '*.js' },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /(?:\.openapi|\.openapi-source|openapi-namespace\.js)$/,
      type: 'javascript/auto',
      use: [openapiLoader],
    });
    return config;
  },
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@langgenius/dify-ui', '@dify/contracts', '@t3-oss/env-core', '@t3-oss/env-nextjs', 'echarts', 'zrender'],
  serverExternalPackages: ['loro-crdt'],
  reactCompiler: false,
  experimental: {
    turbopackGc: true,
  },
  logging: {
    browserToTerminal: process.env.BROWSER_TO_TERMINAL_DISABLED !== 'true',
  },
  outputFileTracingIncludes: {
    '/': ['./migrations/**/*'],
  },
  async redirects() {
    return [
      {
        source: '/explore/apps',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

let configWithPlugins = baseConfig;

// Conditionally enable Sentry configuration
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED && process.env.SENTRY_ORGANIZATION) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    org: process.env.SENTRY_ORGANIZATION,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    webpack: {
      reactComponentAnnotation: {
        enabled: true,
      },
      treeshake: {
        removeDebugLogging: true,
      },
    },
    telemetry: false,
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
