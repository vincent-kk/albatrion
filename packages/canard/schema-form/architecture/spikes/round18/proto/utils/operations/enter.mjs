/**
 * Enter within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function enter(context, node) {
  const root = node.root ?? node;
  if (root.entryDepth++ === 0) {
    root.entryId++;
    root.entryEmit = root.emit;
    root.entryCommit = root.commitNumber;
    root.entrySettles = 0;
    root.entryWaves = 0;
    root.entryWrites.clear();
  }
  return root;
}
