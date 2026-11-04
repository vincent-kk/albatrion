import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

import owners from './fixtures/derivedMemoOwners.json';

it('reduces the 32 inventoried module-derived WeakMap roots to two stores', () => {
  const roots: string[] = [];
  for (const relative of [...owners, 'utils/cache/derivedRecords.ts']) {
    const path = fileURLToPath(new URL('../' + relative, import.meta.url));
    if (!existsSync(path)) continue;
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const retain = (name: ts.Node, value: ts.Expression | undefined) => {
      if (
        value &&
        ts.isNewExpression(value) &&
        value.expression.getText(source) === 'WeakMap'
      )
        roots.push(relative + ':' + name.getText(source));
    };
    for (const statement of source.statements) {
      if (ts.isVariableStatement(statement))
        for (const declaration of statement.declarationList.declarations)
          retain(declaration.name, declaration.initializer);
      if (ts.isClassDeclaration(statement))
        for (const member of statement.members) {
          if (
            ts.isPropertyDeclaration(member) &&
            member.modifiers?.some(
              (modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword,
            )
          )
            retain(member.name, member.initializer);
        }
    }
  }
  expect(roots).toEqual([
    'utils/cache/derivedRecords.ts:blueprintRecords',
    'utils/cache/derivedRecords.ts:hostRecords',
  ]);
});
