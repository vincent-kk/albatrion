/**
 * Write within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function write(context, node, value) {
  const root = context.enter(node);
  let ok = false;
  try {
    context.noteCallerWrite(root, node);
    context.stagingDepth++;
    try {
      context.stageRaw(node, value);
      node.reported = value;
      if (node.isSource) context.markSourceWritten(node);
      context.clearNonObjectAncestors(node);
    } finally {
      context.stagingDepth--;
    }
    context.autoSettle(node);
    ok = true;
  } finally {
    context.leave(root, ok);
  }
}
