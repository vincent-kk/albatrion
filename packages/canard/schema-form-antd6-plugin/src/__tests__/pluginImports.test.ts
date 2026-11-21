import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('keeps plugin source and tests independent of sibling plugin modules', () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const files = [root];
  const imports: string[] = [];
  for (let cursor = 0; cursor < files.length; cursor++) {
    const path = files[cursor];
    if (!/\.[cm]?tsx?$/.test(path)) {
      for (const entry of readdirSync(path, { withFileTypes: true }))
        if (entry.isDirectory() || /\.[cm]?tsx?$/.test(entry.name))
          files.push(resolve(path, entry.name));
      continue;
    }
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const nodes: ts.Node[] = [source];
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];
      node.forEachChild((child) => {
        nodes.push(child);
      });
      const target =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isCallExpression(node) &&
              (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
                node.expression.getText(source) === 'require')
            ? node.arguments[0]
            : undefined;
      if (!target || !ts.isStringLiteral(target)) continue;
      const match = target.text.match(
        /schema-form-(ajv6|ajv7|ajv8|antd5|antd6|antd-mobile|mui)-plugin(?:\/|$)/,
      );
      if (match && match[1] !== 'antd6')
        imports.push(`${path}: ${target.text}`);
    }
  }
  expect(imports).toEqual([]);
});
