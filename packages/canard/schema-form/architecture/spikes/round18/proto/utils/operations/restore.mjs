/**
 * Restore within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} snap snap input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function restore(context, snap) {
  const recs = snap.recs;
  for (let i = 0; i < recs.length; i++) {
    const r = recs[i];
    const n = r.n;
    if (r.kids !== null) context.restoreItems(n, r.kids);
    if (context.rawOf(n) !== r.raw) context.stageRaw(n, r.raw);else context.touch(n);
    n.absent = r.absent;
    if (n.kind !== 'object') continue;
    if (context.extrasOf(n) !== r.extras) {
      n.pendingExtras = r.extras;
      n.hasPendingExtras = true;
    }
  }
  const anc = snap.anc;
  for (let i = 0; i < anc.length; i += 2) if (anc[i + 1] === true && anc[i].children.every(context.isAbsent)) anc[i].absent = true;
}
