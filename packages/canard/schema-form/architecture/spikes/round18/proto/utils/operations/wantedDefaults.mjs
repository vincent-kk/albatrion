/**
 * Wanted defaults within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} host host input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function wantedDefaults(context, root, host) {
  const want = new Map();
  if (!context.existsInShape(host) || context.clearedInTree(root, host)) return want;
  for (const child of host.children) {
    const candidate = !context.wasInShape(child) && context.existsInShape(child);
    if (!candidate || root.cleared.has(child)) continue;
    if (!root.fillSeen.has(child)) {
      root.fillSeen.add(child);
      if (context.isAbsent(child)) {
        const value = context.resolveDefault(host, child);
        if (value !== undefined) root.fillValues.set(child, value);
      }
    }
    if (root.fillValues.has(child)) want.set(child, root.fillValues.get(child));
  }
  return want;
}
