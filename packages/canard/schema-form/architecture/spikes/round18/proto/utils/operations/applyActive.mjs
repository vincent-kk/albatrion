/**
 * Apply active within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} on on input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function applyActive(context, node, on) {
  const cond = node.conditionalKids;
  for (let i = 0; i < cond.length; i++) cond[i].actNext = false;
  const frags = node.fragments;
  for (let i = 0; i < frags.length; i++) {
    if (on[i] === 0) continue;
    const declares = frags[i].declares;
    for (let j = 0; j < declares.length; j++) node.index.get(declares[j]).actNext = true;
  }
}
