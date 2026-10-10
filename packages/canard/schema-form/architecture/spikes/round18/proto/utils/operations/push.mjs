/**
 * Push within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} arr arr input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function push(context, arr, value) {
  const root = context.enter(arr);
  let ok = false;
  try {
    context.noteCallerWrite(root, arr);
    context.stagingDepth++;
    try {
      const item = context.attach(arr, arr.itemFactory(arr.children.length));
      context.touch(arr);
      context.applyValue(item, value, false);
    } finally {
      context.stagingDepth--;
    }
    context.autoSettle(arr);
    ok = true;
  } finally {
    context.leave(root, ok);
  }
}
