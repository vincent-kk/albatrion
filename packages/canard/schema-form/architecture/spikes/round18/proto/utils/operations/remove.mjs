/**
 * Remove within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} arr arr input accepted by the regression model.
 * @param {*} index index input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function remove(context, arr, index) {
  const root = context.enter(arr);
  let ok = false;
  try {
    context.noteCallerWrite(root, arr);
    const kids = arr.children;
    const child = kids[index];
    if (child !== undefined) {
      kids.splice(index, 1);
      child.detached = true;
      child.parent = null;
      for (let i = index; i < kids.length; i++) {
        kids[i].name = i;
        kids[i].pos = i;
      }
      context.touch(arr);
      context.autoSettle(arr);
    }
    ok = true;
  } finally {
    context.leave(root, ok);
  }
}
