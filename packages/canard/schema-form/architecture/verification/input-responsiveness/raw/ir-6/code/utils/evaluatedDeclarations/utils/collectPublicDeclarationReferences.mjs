/**
 * Collect selected public references into the caller-owned traversal queues.
 * @param node - Declaration node from the current compiler program.
 * @param context - Compiler, source, path and mutable queues owned by the description pass.
 * @returns Nothing; indexed runtime access adds only the selected member's symbol.
 */
export function collectPublicDeclarationReferences(node, context) {
  const { ts, checker, printer, source, relative, pending, trail, selections } = context;
if (ts.isIndexedAccessTypeNode(node)) {
  const objectType = checker.getTypeFromTypeNode(node.objectType);
  if (objectType.getSymbol()?.name === 'FieldNodeRuntime') {
    const keyType = checker.getTypeFromTypeNode(node.indexType);
    const keys = keyType.isUnion() ? keyType.types : [keyType];
    const selected = keys.map((key) => key.isStringLiteral() ? key.value : undefined);
    if (selected.some((key) => key === undefined)) throw new Error('Unresolved public runtime selection');
    const expression = printer.printNode(ts.EmitHint.Unspecified, node, source);
    selections.push({ path: [...trail, `${relative}:${expression}`], expression, selectedMembers: selected, evaluatedType: checker.typeToString(checker.getTypeFromTypeNode(node), undefined, ts.TypeFormatFlags.NoTruncation) });
    for (const key of selected) {
      const member = checker.getPropertyOfType(objectType, key);
      if (!member) throw new Error('Selected runtime member is missing: ' + key);
      pending.push({ symbol: member, trail: [...trail, `${relative}:${expression}`, `FieldNodeRuntime.${key}`] });
    }
    return;
  }
}
if (ts.isIdentifier(node)) {
  const next = checker.getSymbolAtLocation(node);
  if (next) pending.push({ symbol: next, trail: [...trail, `${relative}:${next.name}`] });
}
ts.forEachChild(node, (child) => collectPublicDeclarationReferences(child, context));
}
