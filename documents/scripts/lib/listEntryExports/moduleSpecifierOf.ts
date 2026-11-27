import * as ts from 'typescript';

/** The string-literal module specifier of the import or export statement that holds an alias declaration, if any. */
export function moduleSpecifierOf(declaration: ts.Declaration): ts.StringLiteral | undefined {
  const statement = ts.findAncestor(
    declaration,
    (node): node is ts.ImportDeclaration | ts.ExportDeclaration =>
      ts.isImportDeclaration(node) || ts.isExportDeclaration(node),
  );
  const specifier = statement?.moduleSpecifier;
  return specifier && ts.isStringLiteral(specifier) ? specifier : undefined;
}
