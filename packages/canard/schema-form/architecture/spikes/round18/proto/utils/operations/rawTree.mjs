/**
 * Raw tree within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function rawTree(context, node) {
  if (node.kind === 'leaf') return node.raw;
  if (node.raw !== undefined) return node.raw;
  if (node.kind === 'array') return node.children.map(context.rawTree);
  const out = {};
  for (const c of node.children) out[c.name] = context.rawTree(c);
  if (node.extras !== null) for (const k of Object.keys(node.extras)) out[k] = node.extras[k];
  return out;
}
