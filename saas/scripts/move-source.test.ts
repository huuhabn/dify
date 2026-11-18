import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { rewriteSource } from './move-source.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const mappings: [string, string][] = [[resolve(root, 'src/app/components'), resolve(root, 'src/components/dify')]];

test('preserves UI copy while rewriting static imports, dynamic imports, and mock targets', () => {
  const file = resolve(root, 'src/features/example.tsx');
  const source = `import Card from '@/app/components/card';
const card = import('@/app/components/card');
vi.mock('@/app/components/card');
const label = '../label';`;
  const result = rewriteSource(source, file, file, mappings);
  assert.equal(result.includes('@/app/components'), false);
  assert.ok(result.includes("const label = '../label'"));
  assert.equal(result.match(/@\/components\/dify\/card/g)?.length, 3);
});

test('rebases imports from moved files to unchanged route-owned modules', () => {
  const oldFile = resolve(root, 'src/app/components/card/index.tsx');
  const newFile = resolve(root, 'src/components/dify/card/index.tsx');
  const result = rewriteSource("import { factory } from '../../get-query-client';", oldFile, newFile, mappings);
  assert.equal(result, "import { factory } from '../../../app/get-query-client';");
});

test('rebases stylesheet imports without changing CSS declarations', () => {
  const file = resolve(root, 'src/app/styles/globals.css');
  assert.equal(rewriteSource("@import '../components/badge/index.css';\n.card { color: red; }", file, file, mappings),
    "@import '../../components/dify/badge/index.css';\n.card { color: red; }");
});

test('preserves trailing directory slashes used by prefix aliases', () => {
  const file = resolve(root, 'vitest.config.ts');
  const source = "const root = new URL('./src/', import.meta.url);";
  assert.equal(rewriteSource(source, file, file, mappings), source);
});

test('keeps the resolved file when a sibling file and directory share a name', () => {
  const fixture = mkdtempSync(resolve(tmpdir(), 'saas-module-move-'));
  try {
    mkdirSync(resolve(fixture, 'old/badge'), { recursive: true });
    writeFileSync(resolve(fixture, 'old/badge.tsx'), 'export default 1;');
    writeFileSync(resolve(fixture, 'old/badge/index.tsx'), 'export default 2;');
    const source = "import Badge from '../badge';";
    const result = rewriteSource(source, resolve(fixture, 'old/badge/story.tsx'), resolve(fixture, 'new/badge/story.tsx'), [[resolve(fixture, 'old'), resolve(fixture, 'new')]]);
    assert.equal(result, source);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('updates asset aliases embedded in Tailwind background URLs', () => {
  const file = resolve(root, 'src/features/example.tsx');
  const source = "const style = 'bg-[url(~@/app/components/workflow/run/icon.svg)]';";
  assert.equal(rewriteSource(source, file, file, mappings), source.replace('/app/components/', '/components/dify/'));
});

test('rebases Tailwind reference directives when a CSS module moves', () => {
  const oldFile = resolve(root, 'src/app/components/card/style.module.css');
  const newFile = resolve(root, 'src/components/dify/card/style.module.css');
  assert.equal(rewriteSource("@reference '../../styles/globals.css';", oldFile, newFile, mappings),
    "@reference '../../../app/styles/globals.css';");
});
