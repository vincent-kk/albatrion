// Run with node, baseline package, candidate package, and report output arguments.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const [baseline, candidate, output] = process.argv.slice(2).map((p) => path.resolve(p));
const require = createRequire(path.join(candidate, 'package.json'));
const ts = require('typescript');
const printer = ts.createPrinter({ removeComments: true });

/**
 * Follow actual public symbols through aliases and declaration references.
 * @param {string} directory Built package with dependency resolution available.
 * @returns Root export names and comment-free reachable declaration signatures.
 */
function describe(directory) {
  const root = path.join(directory, 'dist');
  const entryPath = path.join(root, 'index.d.ts');
  const program = ts.createProgram([entryPath], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    baseUrl: directory,
    paths: { '@aileron/*': ['./dist/@aileron/*'] },
  });
  const checker = program.getTypeChecker();
  const entry = program.getSourceFile(entryPath);
  assert.ok(entry);
  const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(entry));
  const pending = [...exported];
  const seen = new Set();
  const records = new Set();
  const files = new Set();
  const unresolved = [];
  while (pending.length) {
    let symbol = pending.pop();
    if (!symbol || seen.has(symbol)) continue;
    seen.add(symbol);
    if (symbol.flags & ts.SymbolFlags.Alias) {
      const target = checker.getAliasedSymbol(symbol);
      if (!target.declarations?.length) unresolved.push(symbol.name);
      pending.push(target);
      continue;
    }
    for (const declaration of symbol.declarations ?? []) {
      const source = declaration.getSourceFile();
      const relative = path.relative(root, source.fileName);
      if (relative.startsWith('..') || path.isAbsolute(relative)) continue;
      if (ts.isSourceFile(declaration) || ts.isImportDeclaration(declaration) || ts.isExportDeclaration(declaration)) continue;
      files.add(relative);
      const qualified = checker.getFullyQualifiedName(symbol).replaceAll(directory, '<package>');
      records.add(JSON.stringify([relative, qualified, printer.printNode(ts.EmitHint.Unspecified, declaration, source)]));
      const visit = (node) => {
        if (ts.isIdentifier(node)) pending.push(checker.getSymbolAtLocation(node));
        ts.forEachChild(node, visit);
      };
      visit(declaration);
    }
  }
  assert.deepEqual(unresolved, [], 'Every followed alias resolves');
  return { names: exported.map((s) => s.name).sort(), records: [...records].sort(), files: [...files].sort() };
}

const before = describe(baseline);
const after = describe(candidate);
const removed = before.records.filter((record) => !after.records.includes(record));
const added = after.records.filter((record) => !before.records.includes(record));
const byteDifferences = before.files.filter((file) =>
  fs.readFileSync(path.join(baseline, 'dist', file), 'utf8') !== fs.readFileSync(path.join(candidate, 'dist', file), 'utf8'),
);
const index = fs.readFileSync(path.join(candidate, 'dist/index.d.ts'));
const report = {
  publicExports: after.names.length,
  rootExportsEqual: JSON.stringify(before.names) === JSON.stringify(after.names),
  baselineReachableFiles: before.files.length,
  candidateReachableFiles: after.files.length,
  reachableSignatures: after.records.length,
  semanticDifferences: { added, removed },
  declarationModuleByteDifferences: byteDifferences,
  indexByteDifference: !fs.readFileSync(path.join(baseline, 'dist/index.d.ts')).equals(index),
  indexSha256: createHash('sha256').update(index).digest('hex'),
  method: 'Follow root exports to actual aliased symbols and recursively compare their reachable declaration AST signatures with comments removed; unused barrel exports do not widen the package root.',
};
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
assert.deepEqual(before.names, after.names);
assert.deepEqual(added, []);
assert.deepEqual(removed, []);
console.log('IR6_PUBLIC_DECLARATIONS_OK exports=' + after.names.length + ' signatures=' + after.records.length);
