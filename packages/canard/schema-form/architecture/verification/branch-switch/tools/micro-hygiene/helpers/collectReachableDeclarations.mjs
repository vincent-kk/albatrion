import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/** Resolve a declaration module through the package's public index.
 * @param {string} root Built declaration directory.
 * @returns {string[]} Relative addresses reachable by imports, re-exports and import types.
 */
export function collectReachableDeclarations(root) {
  const pending = ['index.d.ts'];
  const seen = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(path.join(root, file), 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const visit = (node) => {
      const specifier =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
            ? node.argument.literal
            : undefined;
      if (
        specifier &&
        ts.isStringLiteral(specifier) &&
        specifier.text.startsWith('.')
      ) {
        const base = path.resolve(root, path.dirname(file), specifier.text);
        const target = [
          base,
          base.replace(/\.[mc]?js$/, '.d.ts'),
          base + '.d.ts',
          path.join(base, 'index.d.ts'),
        ].find(
          (candidate) =>
            candidate.endsWith('.d.ts') && fs.existsSync(candidate),
        );
        assert.ok(
          target,
          'Unresolved public declaration import: ' +
            file +
            ' -> ' +
            specifier.text,
        );
        const relative = path.relative(root, target);
        assert.ok(
          !relative.startsWith('..') && !path.isAbsolute(relative),
          'Public declaration stays in the copied graph',
        );
        pending.push(relative);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return [...seen].sort();
}
