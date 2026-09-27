/**
 * Restore items within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} arr arr input accepted by the regression model.
 * @param {*} saved saved input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function restoreItems(context, arr, saved) {
  const kids = arr.children;
  for (let i = 0; i < kids.length; i++) {
    if (saved.includes(kids[i])) continue;
    kids[i].detached = true;
    kids[i].parent = null;
  }
  kids.length = 0;
  for (let i = 0; i < saved.length; i++) {
    const k = saved[i];
    k.detached = false;
    k.parent = arr;
    k.pos = i;
    k.name = i;
    kids.push(k);
  }
}
