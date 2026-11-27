import * as ts from 'typescript';

/** Extract the type signature text from a declaration. */
export function extractTypeSignature(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  _fullText: string,
): string {
  if (ts.isVariableStatement(node)) {
    const decl = node.declarationList.declarations[0];
    if (decl && decl.type) {
      const name = ts.isIdentifier(decl.name) ? decl.name.text : 'unknown';
      const typeText = decl.type.getText(sourceFile);
      return `const ${name}: ${typeText}`;
    }
  }
  if (ts.isFunctionDeclaration(node)) {
    const name = node.name?.text || 'unknown';
    const typeParams = node.typeParameters
      ? `<${node.typeParameters.map(tp => tp.getText(sourceFile)).join(', ')}>`
      : '';
    const params = node.parameters
      .map(p => p.getText(sourceFile))
      .join(', ');
    const returnType = node.type ? node.type.getText(sourceFile) : 'void';
    return `function ${name}${typeParams}(${params}): ${returnType}`;
  }
  if (ts.isTypeAliasDeclaration(node)) {
    return node.getText(sourceFile).replace(/^export\s+declare\s+/, '').replace(/;$/, '');
  }
  if (ts.isInterfaceDeclaration(node)) {
    return node.getText(sourceFile).replace(/^export\s+declare\s+/, '').replace(/^export\s+/, '');
  }
  if (ts.isClassDeclaration(node)) {
    // Just return class header, not full body
    const name = node.name?.text || 'unknown';
    const heritage = node.heritageClauses
      ? ' ' + node.heritageClauses.map(h => h.getText(sourceFile)).join(' ')
      : '';
    return `class ${name}${heritage}`;
  }
  if (ts.isEnumDeclaration(node)) {
    return node.getText(sourceFile).replace(/^export\s+declare\s+/, '');
  }
  // Fallback: strip export declare prefix
  const text = node.getText(sourceFile);
  return text.replace(/^export\s+declare\s+/, '').replace(/;$/, '');
}
