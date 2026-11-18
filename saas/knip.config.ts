import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    saas: {
      entry: [
        'scripts/**/*.ts',
        // Loaded through the normalized locale and namespace at runtime.
        'src/i18n/locale-resources/*.ts',
        // Exposed to the standalone Marketplace host through postMessage.
        'src/components/dify/plugins/marketplace/detail-dialog/image-preview-message.ts',
        // next-intl entrypoints are wired during the following migration phase.
        'src/libs/I18n.ts',
        'src/libs/I18nNavigation.ts',
        'src/components/LocaleSwitcher.tsx',
      ],
      project: ['**/*.{js,mjs,cjs,jsx,ts,tsx,css,mdx}', '!public/**'],
      playwright: { entry: ['tests/**/*.@(integ|e2e).ts'] },
      // Reserved for new forms; existing Dify forms keep their implementation.
      ignoreDependencies: ['react-hook-form', '@hookform/resolvers', '@iconify-json/*'],
    },
  },
  compilers: {
    // Tailwind loads JS plugins and CSS references as module dependencies.
    css: (text: string) => [...text.matchAll(/@(?:import|reference|plugin)\s+(['"])([^'"]+)\1/gu)]
      .map(([, , specifier]) => `import ${JSON.stringify(specifier)};`).join('\n'),
  },
  treatConfigHintsAsErrors: true,
};

export default config;
