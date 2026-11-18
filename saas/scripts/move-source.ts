import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const slash = (value: string) => value.split(sep).join('/');

function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const stages: Record<string, [string, string][]> = {
  components: [['src/app/components', 'src/components/dify']],
  providers: [
    ['src/app/query-provider.tsx', 'src/components/providers/query-provider.tsx'],
    ['src/app/query-state-provider.tsx', 'src/components/providers/query-state-provider.tsx'],
    ['src/app/notifications', 'src/components/providers/notifications'],
    ['src/components/dify/provider', 'src/components/providers'],
    ['src/app/get-query-client.ts', 'src/libs/query/get-query-client.ts'],
  ],
  types: walk(resolve(packageRoot, 'src/models')).filter((file) => !file.endsWith('/Schema.ts'))
    .map((file): [string, string] => [slash(relative(packageRoot, file)), `src/types/dify/${relative(resolve(packageRoot, 'src/models'), file)}`]),
  styles: [['src/app/styles', 'src/styles/dify']],
};

/** Rewrites only module references; UI copy and unrelated relative URL strings remain untouched. */
export function rewriteSource(source: string, oldFile: string, newFile: string, mappings: ReadonlyArray<readonly [string, string]>) {
  const remap = (path: string) => {
    for (const [from, to] of mappings) {
      if (path === from || path.startsWith(`${from}/`)) return to + path.slice(from.length);
      // Extensionless module references must follow file moves too.
      if (/\.[cm]?[jt]sx?$/.test(from) && path === from.replace(/\.[cm]?[jt]sx?$/, '')) return to.replace(/\.[cm]?[jt]sx?$/, '');
    }
    return path;
  };
  const rewrite = (value: string, moduleReference = false) => {
    const alias = value.match(/^(@|~@)\/(.*)$/);
    if (alias) {
      const absolute = resolve(packageRoot, 'src', alias[2]);
      const target = remap(absolute);
      if (target === absolute) return value;
      const result = `${alias[1]}/${slash(relative(resolve(packageRoot, 'src'), target))}`;
      return value.endsWith('/') ? `${result}/` : result;
    }
    if (!value.startsWith('.')) return value;
    if (moduleReference) {
      const resolved = ts.resolveModuleName(value, oldFile, { moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve, allowJs: true }, ts.sys).resolvedModule;
      if (resolved && !resolved.isExternalLibraryImport) {
        const targetFile = remap(resolved.resolvedFileName);
        if (oldFile === newFile && targetFile === resolved.resolvedFileName) return value;
        let path = slash(relative(dirname(newFile), targetFile));
        if (!/\.(?:[cm]?[jt]sx?|json)$/.test(value)) path = path.replace(/(?:\.d)?\.[cm]?[jt]sx?$/, '');
        return path.startsWith('.') ? path : `./${path}`;
      }
    }
    const target = remap(resolve(dirname(oldFile), value));
    const result = slash(relative(dirname(newFile), target));
    const specifier = result.startsWith('.') ? result : `./${result}`;
    return value.endsWith('/') && !specifier.endsWith('/') ? `${specifier}/` : specifier;
  };
  if (oldFile.endsWith('.css')) {
    return source.replace(/(@(?:import|source|plugin|reference)\s+(?:not\s+)?['"])([^'"]+)(['"])/g,
      (_match: string, before: string, value: string, after: string) => `${before}${rewrite(value)}${after}`)
      .replace(/(url\(\s*['"]?)(\.[^)'"\s]+)(['"]?\s*\))/g,
        (_match: string, before: string, value: string, after: string) => `${before}${rewrite(value)}${after}`);
  }
  const tree = ts.createSourceFile(oldFile, source, ts.ScriptTarget.Latest, true);
  const edits: { start: number; end: number; value: string }[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      const alias = /^~?@\//.test(node.text);
      const moduleReference = ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)
        || ts.isExternalModuleReference(parent) || (ts.isLiteralTypeNode(parent) && ts.isImportTypeNode(parent.parent))
        || (ts.isCallExpression(parent) && (
          parent.expression.kind === ts.SyntaxKind.ImportKeyword
          || /(?:require|mock|doMock|unmock|importActual|importMock)$/.test(parent.expression.getText(tree))
        )) || (ts.isNewExpression(parent) && parent.expression.getText(tree) === 'URL');
      const raw = source.slice(node.getStart(tree) + 1, node.end - 1);
      let updated = alias || moduleReference ? rewrite(node.text, moduleReference) : raw;
      updated = updated.replace(/(url\(\s*['"]?)(~?@\/[^)'"\s]+)(['"]?\s*\))/g,
        (_match: string, before: string, value: string, after: string) => `${before}${rewrite(value)}${after}`);
      if (updated !== raw) edits.push({ start: node.getStart(tree) + 1, end: node.end - 1, value: updated });
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  return source;
}

const stage = process.argv.find((argument) => argument.startsWith('--stage='))?.slice(8);
if (stage) {
  assert.ok(stage in stages, `Unknown move stage: ${stage}`);
  const batch = process.argv.find((argument) => argument.startsWith('--batch='))?.slice(8);
  assert.ok(!batch || (stage === 'components' && /^[a-z][a-z0-9-]*$/.test(batch)), 'Batches must name one components directory.');
  const selected: [string, string][] = batch ? [[`src/app/components/${batch}`, `src/components/dify/${batch}`]] : stages[stage];
  const mappings = selected.map(([from, to]): [string, string] => [resolve(packageRoot, from), resolve(packageRoot, to)]);
  const remap = (path: string) => {
    for (const [from, to] of mappings) if (path === from || path.startsWith(`${from}/`)) return to + path.slice(from.length);
    return path;
  };
  const files = [
    ...walk(resolve(packageRoot, 'src')),
    ...walk(resolve(packageRoot, '.storybook')),
    ...walk(resolve(packageRoot, 'tests')),
    ...readdirSync(packageRoot).filter((name) => /\.(?:ts|tsx|mjs)$/.test(name)).map((name) => resolve(packageRoot, name)),
  ];
  const moves: { from: string; to: string }[] = [];
  const changes: { file: string; source: string }[] = [];
  for (const file of files) {
    const destination = remap(file);
    if (destination !== file) {
      assert.ok(!existsSync(destination), `Refusing to overwrite ${relative(packageRoot, destination)}`);
      moves.push({ from: slash(relative(packageRoot, file)), to: slash(relative(packageRoot, destination)) });
    }
    if (!/\.(?:[cm]?[jt]sx?|css)$/.test(file)) continue;
    const before = readFileSync(file, 'utf8');
    const after = rewriteSource(before, file, destination, mappings);
    if (before !== after) changes.push({ file: destination, source: after });
  }
  assert.equal(new Set(moves.map((move) => move.to)).size, moves.length, 'Multiple moves share one destination.');
  console.log(JSON.stringify({ stage, batch, moves: moves.length, rewrittenFiles: changes.length, apply: process.argv.includes('--apply') }));
  if (process.argv.includes('--apply')) {
    for (const move of moves) {
      const destination = resolve(packageRoot, move.to);
      mkdirSync(dirname(destination), { recursive: true });
      renameSync(resolve(packageRoot, move.from), destination);
    }
    for (const change of changes) writeFileSync(change.file, change.source);
    if (moves.length) writeFileSync(resolve(packageRoot, `../plans/001-moves-${stage}${batch ? `-${batch}` : ''}.json`), `${JSON.stringify(moves, null, 2)}\n`);
  }
}
