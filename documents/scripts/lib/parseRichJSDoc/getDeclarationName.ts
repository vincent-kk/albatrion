import * as ts from 'typescript';

/** Get the name of a declaration node. */
export function getDeclarationName(node: ts.Node): string | null {
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    return decl && ts.isIdentifier(decl.name) ? decl.name.text : null;
  }
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text;
  if (ts.isClassDeclaration(node) && node.name) return node.name.text;
  if (ts.isTypeAliasDeclaration(node)) return node.name.text;
  if (ts.isInterfaceDeclaration(node)) return node.name.text;
  if (ts.isEnumDeclaration(node)) return node.name.text;
  return null;
}
