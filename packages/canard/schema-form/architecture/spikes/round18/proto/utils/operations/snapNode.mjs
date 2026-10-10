/**
 * Snap node within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} n n input accepted by the regression model.
 * @param {*} recs recs input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function snapNode(context, n, recs) {
  const obj = n.kind === 'object';
  recs.push({
    n,
    raw: context.rawOf(n),
    absent: n.absent,
    extras: obj ? context.extrasOf(n) : null,
    kids: n.kind === 'array' ? n.children.slice() : null
  });
  const kids = n.children;
  if (kids !== null) for (let i = 0; i < kids.length; i++) context.snapNode(kids[i], recs);
}
