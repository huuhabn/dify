/** Disjoint test patterns keep migrated tests visible during the runner transition. */
export const testPatterns = {
  unit: ['src/**/*.test.{js,ts}'],
  legacy: ['src/**/*.spec.{js,jsx,ts,tsx}', 'src/{app,features,hooks,components/dify}/**/*.test.{js,ts}'],
  browser: ['src/**/*.browser.spec.{ts,tsx}'],
  ui: ['src/**/*.test.tsx'],
};

export const unitExcludes = ['src/{app,features,hooks,components/dify}/**/*.test.{js,ts}'];
export const legacyExcludes = [
  ...testPatterns.browser,
  ...testPatterns.ui,
];

/** Mirrors the explicit runner patterns without importing or collecting test modules. */
export function getTestProject(file: string) {
  if (/\.browser\.spec\.tsx?$/.test(file)) return 'browser';
  if (/\.test\.tsx$/.test(file)) return 'ui';
  if (/\.test\.(?:js|ts)$/.test(file) && !/^src\/(?:app|features|hooks|components\/dify)\//.test(file)) return 'unit';
  if (/\.(?:spec|test)\.[jt]sx?$/.test(file)) return 'legacy';
  return undefined;
}
