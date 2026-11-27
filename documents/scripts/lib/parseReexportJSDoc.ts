import * as fs from 'node:fs';
import * as ts from 'typescript';

import { extractJSDocComment } from './extractJSDocComment';
import { parseJSDocFields } from './parseJSDocFields';
import type { ExternalSource, ParsedFunction } from './types';

/**
 * Parse a statement that re-exports a declaration from another module,
 * `export { isValidElement as isReactElement } from 'react';`: the doc comment
 * on the statement supplies the description and examples, and the statement
 * text stands in for the signature.
 *
 * @param dtsPath - Absolute path of the .d.ts file that holds the statement; it must exist.
 * @param source - Module the statement re-exports from, and the name the statement takes from it.
 * @param packageName - Package name, e.g. "@winglet/react-utils".
 * @param packageVersion - Package version used by the playground.
 * @param categoryPath - Category directory of the page; empty directly under the package directory.
 * @returns The entry named `source.originalName`, without description when the statement has no doc
 *   comment; null when no `export { ... } from` statement takes that name from that module.
 */
export function parseReexportJSDoc(
  dtsPath: string,
  source: ExternalSource,
  packageName: string,
  packageVersion: string,
  categoryPath: string,
): ParsedFunction | null {
  const content = fs.readFileSync(dtsPath, 'utf-8');
  const sourceFile = ts.createSourceFile(dtsPath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statement = sourceFile.statements.find(
    (node): node is ts.ExportDeclaration =>
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === source.moduleSpecifier &&
      node.exportClause !== undefined &&
      ts.isNamedExports(node.exportClause) &&
      node.exportClause.elements.some(element => (element.propertyName ?? element.name).text === source.originalName),
  );
  if (!statement) return null;
  return {
    name: source.originalName,
    kind: 're-export',
    typeSignature: statement.getText(sourceFile),
    ...parseJSDocFields(extractJSDocComment(statement, content)),
    packageName,
    packageVersion,
    categoryPath,
    sourceFile: dtsPath,
    importPaths: [],
    externalSource: source,
  };
}
