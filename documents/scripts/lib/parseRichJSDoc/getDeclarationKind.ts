import * as ts from 'typescript';

import type { ParsedFunction } from '../types';

/** Determine the kind of a declaration. */
export function getDeclarationKind(node: ts.Node): ParsedFunction['kind'] {
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    if (decl && decl.type) {
      const typeText = decl.type.getText();
      // If the type annotation is a function signature, treat as function
      if (typeText.includes('=>') || typeText.includes('(...')) return 'function';
    }
    return 'const';
  }
  return 'const';
}
