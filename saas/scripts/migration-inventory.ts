import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTestProject } from './test-projects.ts';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(packageRoot, '..');
const baselinePath = resolve(repoRoot, 'plans/001-inventory.json');
const normalize = (path: string) => path.split(sep).join('/');

function listFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }).sort();
}

function routeURL(path: string) {
  const segments = path.split('/').slice(2, -1)
    .filter((segment) => !segment.startsWith('(') && !segment.startsWith('@'));
  return `/${segments.join('/')}`;
}

function inspect() {
  const files = listFiles(resolve(packageRoot, 'src'));
  const routes: { file: string; url: string; kind: 'api' | 'page' }[] = [];
  const layouts: string[] = [];
  const tests: Record<NonNullable<ReturnType<typeof getTestProject>>, string[]> = { unit: [], legacy: [], browser: [], ui: [] };
  const imports: Record<'appComponents' | 'i18nAlias' | 'webSource', string[]> = { appComponents: [], i18nAlias: [], webSource: [] };
  const cssEntrypoints: string[] = [];
  const cssReferenceErrors: { file: string; specifier: string }[] = [];
  const locales = new Set<string>();
  const topLevel: Record<string, number> = {};
  for (const absolute of files) {
    const path = normalize(relative(packageRoot, absolute));
    const directory = path.split('/')[1];
    topLevel[directory] = (topLevel[directory] ?? 0) + 1;
    const project = getTestProject(path);
    if (project) tests[project].push(path);
    if (/^src\/app\/(?:.*\/)?(?:page|route)\.[jt]sx?$/.test(path)) {
      routes.push({ file: path, url: routeURL(path), kind: /\/route\./.test(path) ? 'api' : 'page' });
    }
    if (/^src\/app\/(?:.*\/)?layout\.tsx$/.test(path)) layouts.push(path);
    const locale = path.match(/^src\/i18n\/locales\/([^/]+)\//)?.[1];
    if (locale) locales.add(locale);
    if (!/\.(?:[cm]?[jt]sx?|css)$/.test(path)) continue;
    const source = readFileSync(absolute, 'utf8');
    if (path.endsWith('.css')) {
      for (const match of source.matchAll(/@(?:import|reference|plugin)\s+(['"])([^'"]+)\1/g)) {
        const specifier = match[2];
        const target = specifier.startsWith('.') ? resolve(dirname(absolute), specifier)
          : /^~?@\//.test(specifier) ? resolve(packageRoot, 'src', specifier.replace(/^~?@\//, '')) : undefined;
        if (target && !existsSync(target)) cssReferenceErrors.push({ file: path, specifier });
      }
    }
    if (source.includes('@/app/components')) imports.appComponents.push(path);
    if (source.includes("'#i18n'") || source.includes('"#i18n"')) imports.i18nAlias.push(path);
    if (/from\s+['"][^'"]*(?:\.\.\/)+web\//.test(source)) imports.webSource.push(path);
    if (path.endsWith('.css') && source.includes('@import') && /(?:globals?|tailwind-core)\.css$/.test(path)) cssEntrypoints.push(path);
  }
  return {
    schemaVersion: 1,
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim(),
    files: files.length,
    topLevel,
    routes,
    layouts,
    localeDirectories: [...locales].sort(),
    tests,
    imports,
    cssEntrypoints,
    cssReferenceErrors,
  };
}

async function verifyDiscovery(inventory: ReturnType<typeof inspect>) {
  const { createVitest } = await import('vitest/node');
  const context = await createVitest({ root: packageRoot, config: resolve(packageRoot, 'vitest.config.ts'), watch: false });
  try {
    const specs = await context.globTestSpecifications();
    const discovered = specs.map((spec) => normalize(relative(packageRoot, spec.moduleId)));
    assert.equal(new Set(discovered).size, discovered.length, 'A test file belongs to multiple projects.');
    const expected = Object.values(inventory.tests).flat().sort();
    assert.deepEqual([...discovered].sort(), expected, 'Vitest discovery does not match the source test inventory.');
    for (const spec of specs) {
      const file = normalize(relative(packageRoot, spec.moduleId));
      const actual = spec.project.name.split(' ')[0];
      assert.equal(actual, getTestProject(file), `Unexpected test project for ${file}`);
    }
    console.log(`Vitest discovery reconciled: ${expected.length} files, no missing or duplicated entries.`);
  } finally {
    await context.close();
  }
}

const inventory = inspect();
if (process.argv.includes('--write-baseline')) {
  writeFileSync(baselinePath, `${JSON.stringify(inventory, null, 2)}\n`);
  console.log(`Saved ${relative(repoRoot, baselinePath)}`);
} else if (process.argv.includes('--check')) {
  const baseline: ReturnType<typeof inspect> = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const routeRetirementsPath = resolve(repoRoot, 'plans/001-route-retirements.json');
  const retiredRoutes: { kind: string; url: string; removedFeature: string; reason: string }[] = existsSync(routeRetirementsPath)
    ? JSON.parse(readFileSync(routeRetirementsPath, 'utf8')) : [];
  for (const retirement of retiredRoutes) {
    assert.ok(retirement.reason && !existsSync(resolve(packageRoot, retirement.removedFeature)), 'A route retirement needs a reason and a removed feature.');
    assert.ok(baseline.routes.some(({ kind, url }) => kind === retirement.kind && url === retirement.url), 'Unknown retired route.');
  }
  const routeKeys = (value: ReturnType<typeof inspect>) => value.routes.map(({ kind, url }) => `${kind}:${url}`).sort();
  const expectedRoutes = { ...baseline, routes: baseline.routes.filter((route) => !retiredRoutes.some(({ kind, url }) => route.kind === kind && route.url === url)) };
  assert.deepEqual(routeKeys(inventory), routeKeys(expectedRoutes), 'Public route inventory changed; review the route manifest before accepting a migration.');
  assert.deepEqual(inventory.localeDirectories, baseline.localeDirectories, 'Locale inventory changed; review locale parity before accepting a migration.');
  assert.equal(inventory.imports.webSource.length, 0, 'SaaS source must not import legacy web source.');
  const testCount = Object.values(inventory.tests).flat().length;
  const baselineCount = Object.values(baseline.tests).flat().length;
  const retirementsPath = resolve(repoRoot, 'plans/001-test-retirements.json');
  const retiredTests: { file: string; removedFeature: string; reason: string }[] = existsSync(retirementsPath)
    ? JSON.parse(readFileSync(retirementsPath, 'utf8')) : [];
  const baselineFiles = Object.values(baseline.tests).flat();
  const movedFiles: { from: string; to: string }[] = readdirSync(resolve(repoRoot, 'plans'))
    .filter((name) => /^001-moves-.*\.json$/.test(name)).sort()
    .flatMap((name) => JSON.parse(readFileSync(resolve(repoRoot, 'plans', name), 'utf8')));
  const currentFiles = new Set(Object.values(inventory.tests).flat());
  for (const retirement of retiredTests) {
    assert.ok(baselineFiles.includes(retirement.file) && retirement.reason, 'A test retirement must identify a known baseline scenario and a reason.');
    assert.ok(!existsSync(resolve(packageRoot, retirement.file)) && !existsSync(resolve(packageRoot, retirement.removedFeature)), 'Retired test and feature must actually be removed.');
  }
  for (let file of baselineFiles.filter((path) => !retiredTests.some((entry) => entry.file === path))) {
    for (const move of movedFiles) if (move.from === file) file = move.to;
    assert.ok(currentFiles.has(file), `Baseline test disappeared: ${file}; new tests cannot mask a missing scenario.`);
  }
  assert.ok(testCount >= baselineCount - retiredTests.length, 'Test inventory shrank without a retirement record.');
  assert.equal(inventory.cssReferenceErrors.length, 0, `Missing stylesheet references: ${JSON.stringify(inventory.cssReferenceErrors)}`);
  await verifyDiscovery(inventory);
  console.log(`Migration invariants passed: ${inventory.routes.length} routes, ${inventory.localeDirectories.length} locale directories, ${testCount} test files.`);
} else {
  console.log(JSON.stringify(inventory, null, 2));
}
console.log(JSON.stringify({ files: inventory.files, tests: Object.fromEntries(Object.entries(inventory.tests).map(([project, files]) => [project, files.length])) }));
