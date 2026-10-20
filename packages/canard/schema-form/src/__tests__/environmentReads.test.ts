import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

/** Returns product sources while leaving verification and legacy code outside the contract. */
const productFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? ['__tests__', '__benchmarks__', '__legacy__'].includes(entry.name)
        ? []
        : productFiles(target)
      : /\.tsx?$/.test(entry.name)
        ? [target]
        : [];
  });

it('reads NODE_ENV only once in a private top-level constant per product module', () => {
  const sourceRoot = fileURLToPath(new URL('..', import.meta.url));
  const violations: string[] = [];
  for (const file of productFiles(sourceRoot)) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    let reads = 0;
    /** Checks environment access at its declaration rather than accepting nested runtime reads. */
    const visit = (node: ts.Node): void => {
      if (
        ts.isPropertyAccessExpression(node) &&
        node.getText(source) === 'process.env.NODE_ENV'
      ) {
        reads++;
        let declaration: ts.Node = node;
        while (declaration.parent && !ts.isVariableDeclaration(declaration))
          declaration = declaration.parent;
        const list = declaration.parent;
        const statement = list?.parent;
        const valid =
          ts.isVariableDeclaration(declaration) &&
          declaration.initializer !== undefined &&
          declaration.initializer.pos <= node.pos &&
          declaration.initializer.end >= node.end &&
          ts.isVariableDeclarationList(list) &&
          (list.flags & ts.NodeFlags.Const) !== 0 &&
          ts.isVariableStatement(statement) &&
          statement.parent === source &&
          !statement.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
          ) &&
          !source.statements.some(
            (item) =>
              ts.isExportDeclaration(item) &&
              item.exportClause !== undefined &&
              ts.isNamedExports(item.exportClause) &&
              item.exportClause.elements.some(
                (element) =>
                  (element.propertyName ?? element.name).text ===
                  declaration.name.getText(source),
              ),
          );
        if (!valid)
          violations.push(
            `${path.relative(sourceRoot, file)}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
          );
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    if (reads > 1)
      violations.push(`${path.relative(sourceRoot, file)}: duplicate reads`);
  }
  expect(violations).toEqual([]);
});
