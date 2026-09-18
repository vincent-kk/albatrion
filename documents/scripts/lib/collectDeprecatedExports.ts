import * as ts from 'typescript';
import * as fs from 'node:fs';

/**
 * Collects the names a barrel .d.ts marks deprecated on its re-export
 * specifiers (`export { \/** tag *\/ oldName } from ...`), where the
 * deprecation of an alias lives at the export boundary rather than on its
 * declaration.
 *
 * @param dtsPath - Absolute path to the barrel .d.ts file; it must exist.
 * @returns The exported names whose specifier carries the deprecation tag.
 */
export function collectDeprecatedExports(dtsPath: string): Set<string> {
  const content = fs.readFileSync(dtsPath, 'utf-8');
  const sourceFile = ts.createSourceFile(dtsPath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) continue;
    for (const specifier of statement.exportClause.elements) {
      if (ts.getJSDocDeprecatedTag(specifier)) names.add(specifier.name.text);
    }
  }
  return names;
}
