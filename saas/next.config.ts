import { env } from './src/env';
import { Env } from './src/libs/Env';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

// Define the base Next.js configuration
const openapiLoader = { loader: '@dify/openapi-content-mapper/loader' };

const baseConfig: NextConfig = {
  agentRules: false,
  distDir: Env.SAAS_OUTPUT_DIR ?? '.next',
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
    tsconfigPath: Env.SAAS_OUTPUT_DIR === '.next-e2e' ? 'tsconfig.e2e.json' : 'tsconfig.json',
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@langgenius/dify-ui', '@dify/contracts', '@t3-oss/env-core', '@t3-oss/env-nextjs', 'echarts', 'zrender'],
  serverExternalPackages: ['loro-crdt'],
  reactCompiler: false,
  experimental: {
    turbopackGc: true,
  },
  logging: {
    browserToTerminal: Env.BROWSER_TO_TERMINAL_DISABLED !== true,
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
if (!Env.NEXT_PUBLIC_SENTRY_DISABLED && Env.SENTRY_ORGANIZATION) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    org: Env.SENTRY_ORGANIZATION,
    project: Env.SENTRY_PROJECT,
    silent: !Env.CI,
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
