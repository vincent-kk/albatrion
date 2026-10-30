/**
 * Capture references before a write or round without evaluating product getters.
 * @param {any} root - Live record at the observation boundary
 * @returns {Map<any, any>} Record identity mapped to immutable reference witnesses
 */
export function snapshotNodes(root) {
  const result = new Map();
  const pending = [root];
  while (pending.length) {
    const node = pending.pop();
    result.set(node, {
      path: node.path,
      local: node.local,
      emit: node.emit,
      raw: node.raw,
      schema: node.schema,
      active: node.active,
      children: node.children,
      branch: node.behavior.strategy === 'branch',
    });
    pending.push(...(node.children ?? []));
  }
  return result;
}
