/**
 * Count native analysis collections in an in-memory diagnostic bundle only.
 * @param source - H or W TypeScript bytes; the on-disk product source stays unchanged
 * @param relative - Repository-relative source path used as the aggregate key
 * @param ts - Installed TypeScript parser, supplied by the measurement runner
 * @returns TypeScript with allocation wrappers, without per-allocation traces
 */
export function instrumentRound93Structures(source, relative, ts) {
  if (!relative.includes('/src/core/blueprint/') &&
    !relative.includes('/src/core/settle/')) return source;
  const parsed = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  const pending = [parsed];
  while (pending.length) {
    const node = pending.pop();
    if (ts.isNewExpression(node) &&
      ['Map', 'Set', 'WeakMap', 'WeakSet'].includes(node.expression.getText(parsed))) {
      const parent = node.parent;
      const owner = (ts.isVariableDeclaration(parent) || ts.isPropertyDeclaration(parent) ||
        ts.isPropertyAssignment(parent)) ? parent.name.getText(parsed) :
        parent.getText(parsed).includes('declarationOwners') ? 'declarationOwners' : 'anonymous';
      const key = `${relative.split('/src/core/')[1]}:${owner}:${node.expression.getText(parsed)}`;
      edits.push({ position: node.getStart(parsed), text: `globalThis.__round93Count(${JSON.stringify(key)}, ` });
      edits.push({ position: node.end, text: ')' });
    }
    ts.forEachChild(node, child => { pending.push(child); });
  }
  edits.sort((a, b) => b.position - a.position);
  for (let index = 0; index < edits.length; index++) {
    const edit = edits[index];
    source = source.slice(0, edit.position) + edit.text + source.slice(edit.position);
  }
  return source;
}
