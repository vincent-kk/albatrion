import ts from 'typescript';

/** Normalize one declaration node using only the proven local alias bindings.
 * @param {import('typescript').Node} n Current declaration node.
 * @param {import('typescript').TransformationContext} context TypeScript traversal context.
 * @param {Record<string, string>} names Canonical utility names by local import alias.
 * @param {import('typescript').SourceFile} sf Original source for stable printing.
 * @returns {import('typescript').Node | undefined} The equivalent node, omitting redundant utility-only imports.
 */
export function normalizeDeclarationNode(n, context, names, sf) {
  let node = ts.visitEachChild(
    n,
    (child) => normalizeDeclarationNode(child, context, names, sf),
    context,
  );
  if (
    ts.isImportDeclaration(node) &&
    node.moduleSpecifier.text.includes('@aileron/declare') &&
    node.importClause?.namedBindings &&
    ts.isNamedImports(node.importClause.namedBindings)
  ) {
    const remaining = node.importClause.namedBindings.elements.filter(
      (e) => !names[e.name.text],
    );
    if (!remaining.length) return undefined;
    return ts.factory.updateImportDeclaration(
      node,
      node.modifiers,
      ts.factory.updateImportClause(
        node.importClause,
        node.importClause.isTypeOnly,
        node.importClause.name,
        ts.factory.createNamedImports(remaining),
      ),
      node.moduleSpecifier,
      node.attributes,
    );
  }
  if (ts.isParenthesizedTypeNode(node)) return node.type;
  const importedUtility =
    ts.isImportTypeNode(node) &&
    ts.isLiteralTypeNode(node.argument) &&
    ts.isStringLiteral(node.argument.literal) &&
    node.argument.literal.text.includes('@aileron/declare') &&
    node.qualifier &&
    ts.isIdentifier(node.qualifier) &&
    (node.qualifier.text === 'Dictionary' ||
      node.qualifier.text === 'Nullable' ||
      node.qualifier.text === 'Optional' ||
      node.qualifier.text === 'Nullish')
      ? node.qualifier.text
      : undefined;
  if (
    (ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      names[node.typeName.text]) ||
    importedUtility
  ) {
    const name = importedUtility ?? names[node.typeName.text],
      arg =
        node.typeArguments?.[0] ??
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    if (name === 'Dictionary')
      node = ts.factory.createTypeReferenceNode('Record', [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        arg,
      ]);
    else if (name === 'Nullable')
      node = ts.factory.createUnionTypeNode([
        arg,
        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
      ]);
    else if (name === 'Optional')
      node = ts.factory.createUnionTypeNode([
        arg,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
      ]);
    else
      node = ts.factory.createUnionTypeNode([
        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
      ]);
  }
  if (ts.isUnionTypeNode(node)) {
    const flat = [];
    function collect(t) {
      if (ts.isParenthesizedTypeNode(t)) collect(t.type);
      else if (ts.isUnionTypeNode(t)) for (const x of t.types) collect(x);
      else flat.push(t);
    }
    for (const t of node.types) collect(t);
    const printer = ts.createPrinter({ removeComments: true });
    flat.sort((a, b) =>
      printer
        .printNode(ts.EmitHint.Unspecified, a, sf)
        .localeCompare(printer.printNode(ts.EmitHint.Unspecified, b, sf)),
    );
    node = ts.factory.createUnionTypeNode(flat);
  }
  return node;
}
