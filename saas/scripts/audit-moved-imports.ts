import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const originalsPath = process.argv.find((argument) => argument.startsWith('--originals='))?.slice(12);
assert.ok(originalsPath, 'Provide a JSON object of committed module paths and their source using --originals=path.');
const originals: Record<string, string> = JSON.parse(readFileSync(originalsPath, 'utf8'));
const directories = process.argv.filter((argument) => argument.startsWith('--directory=')).map((argument): [string, string] => {
  const [from, to] = argument.slice(12).split(':');
  assert.ok(from && to, 'Use --directory=old/path:new/path.');
  return [resolve(root, from), resolve(root, to)];
});
const map = (path: string) => {
  for (const [from, to] of directories) if (path === from || path.startsWith(`${from}/`)) return to + path.slice(from.length);
  return path;
};
const host = {
  ...ts.sys,
  fileExists: (path: string) => ts.sys.fileExists(path) || ts.sys.fileExists(map(path)),
  directoryExists: (path: string) => ts.sys.directoryExists(path) || ts.sys.directoryExists(map(path)),
  readFile: (path: string) => ts.sys.readFile(path) ?? ts.sys.readFile(map(path)),
};
const options = { moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve, allowJs: true };
function modules(source: string, file: string) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const found: { value: string; start: number; end: number }[] = [];
  function visit(node: ts.Node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent = node.parent;
      if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isExternalModuleReference(parent)
        || (ts.isLiteralTypeNode(parent) && ts.isImportTypeNode(parent.parent))
        || (ts.isCallExpression(parent) && (parent.expression.kind === ts.SyntaxKind.ImportKeyword
          || /(?:require|mock|doMock|unmock|importActual|importMock)$/.test(parent.expression.getText(tree))))) {
        found.push({ value: node.text, start: node.getStart(tree) + 1, end: node.end - 1 });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return found;
}
let checked = 0;
const repairs: { file: string; before: string; after: string }[] = [];
for (const [file, original] of Object.entries(originals)) {
  const oldFile = resolve(root, file);
  const newFile = map(oldFile);
  if (oldFile === newFile || !existsSync(newFile)) continue;
  const source = readFileSync(newFile, 'utf8');
  const before = modules(original, oldFile);
  const after = modules(source, newFile);
  assert.equal(before.length, after.length, `Import count changed in ${file}`);
  const edits: { value: string; start: number; end: number; replacement: string }[] = [];
  for (let index = 0; index < before.length; index++) {
    const old = before[index];
    const current = after[index];
    if (!old.value.startsWith('.')) continue;
    const expected = ts.resolveModuleName(old.value, oldFile, options, host).resolvedModule;
    const actual = ts.resolveModuleName(current.value, newFile, options, ts.sys).resolvedModule;
    if (!expected || expected.isExternalLibraryImport) continue;
    checked++;
    const target = map(expected.resolvedFileName);
    if (target === actual?.resolvedFileName) continue;
    let specifier = relative(dirname(newFile), target).split('\\').join('/');
    if (!/\.(?:[cm]?[jt]sx?|json)$/.test(old.value)) specifier = specifier.replace(/(?:\.d)?\.[cm]?[jt]sx?$/, '');
    if (!specifier.startsWith('.')) specifier = `./${specifier}`;
    edits.push({ ...current, replacement: specifier });
    repairs.push({ file: relative(root, newFile), before: current.value, after: specifier });
  }
  if (edits.length && process.argv.includes('--apply')) {
    let updated = source;
    for (const edit of edits.sort((a, b) => b.start - a.start)) updated = updated.slice(0, edit.start) + edit.replacement + updated.slice(edit.end);
    writeFileSync(newFile, updated);
  }
}
console.log(JSON.stringify({ checkedRelativeImports: checked, repairs }, null, 2));
if (repairs.length && !process.argv.includes('--apply')) process.exitCode = 1;
