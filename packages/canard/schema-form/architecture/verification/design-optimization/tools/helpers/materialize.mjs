/** Read every mounted node bottom-up, including legacy child wrappers, before returning its root. */
export function materialize(root) {
  const stack = [{ node: root, leave: false }];
  const visited = new Set();
  while (stack.length) {
    const { node, leave } = stack.pop();
    if (leave) {
      void node.value;
      continue;
    }
    if (visited.has(node)) continue;
    visited.add(node);
    stack.push({ node, leave: true });
    const children = node.children ?? [];
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i]?.node ?? children[i];
      if (child && typeof child === 'object' && 'value' in child)
        stack.push({ node: child, leave: false });
    }
  }
  return root;
}
