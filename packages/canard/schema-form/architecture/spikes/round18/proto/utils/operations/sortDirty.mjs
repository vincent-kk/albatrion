/**
 * Sort dirty within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} kids kids input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function sortDirty(context, kids) {
  for (let i = 1; i < kids.length; i++) {
    if (kids[i - 1].pos > kids[i].pos) {
      kids.sort((a, b) => a.pos - b.pos);
      return;
    }
  }
}
