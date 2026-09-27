/**
 * Batch within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} fn fn input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function batch(context, root, fn) {
  context.enter(root);
  let ok = false;
  try {
    context.batchDepth++;
    try {
      fn();
    } finally {
      context.batchDepth--;
    }
    if (context.batchDepth === 0 && root.dirty) context.settle(root);
    ok = true;
  } finally {
    context.leave(root, ok);
  }
}
