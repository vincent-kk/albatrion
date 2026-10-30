// Loaded by the retention observation; follows only engine-owned node links.
/**
 * Collect unique node instances reachable from the current host graph.
 * @param {object} root Runtime root with shape and inactive-source links.
 * @returns {object[]} Nodes including parents reached through retained sources.
 */
export function collectRetainedNodes(root) {
  const seen = new Set();
  const pending = [root];
  while (pending.length) {
    const node = pending.pop();
    if (seen.has(node)) continue;
    seen.add(node);
    if (node.parent) pending.push(node.parent);
    pending.push(...(node.children ?? []));
    pending.push(...(node.inactiveSlots?.values() ?? []));
    pending.push(...(node.inactiveSlotChildren?.values() ?? []));
  }
  return [...seen];
}
