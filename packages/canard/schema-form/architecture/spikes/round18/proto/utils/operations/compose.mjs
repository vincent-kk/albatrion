/**
 * Compose within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} sid sid input accepted by the regression model.
 * @param {*} activeSame activeSame input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function compose(context, node, sid, activeSame) {
  context.counters.composes++;
  const prev = node.local;
  const prevKeys = node.localKeys;
  const children = node.children;
  const extras = context.extrasOf(node);
  if (!node.root.schemaMode && activeSame && prev !== context.MISSING && node.hasPendingExtras === false) {
    const kids = node.dirtyKids;
    let out = prev;
    let shape = true;
    for (let i = 0; i < kids.length; i++) {
      const c = kids[i];
      if (c.detached || c.conditional && c.actNext === false) continue;
      const m = context.emitOf(c, sid);
      const had = prev[c.name] !== undefined;
      if (m === context.MISSING === had) {
        shape = false;
        break;
      }
      if (m === context.MISSING || prev[c.name] === m) continue;
      if (out === prev) out = context.cloneFast(prev);
      out[c.name] = m;
    }
    if (shape) {
      node.nextLocalKeys = prevKeys;
      return out;
    }
  }
  context.counters.rebuilds++;
  const out = {};
  const keys = [];
  for (let i = 0; i < children.length; i++) {
    const c = children[i];
    if (c.conditional && c.actNext === false || c.controlNext?.active === false) continue;
    const m = context.emitOf(c, sid);
    if (m === context.MISSING) continue;
    out[c.name] = m;
    keys.push(c.name);
  }
  if (extras !== null) {
    for (const k of context.extrasKeys(extras)) {
      out[k] = extras[k];
      keys.push(k);
    }
  }
  node.nextLocalKeys = keys;
  if (node.root.schemaMode && context.sameValue(prev, out)) return prev;
  return keys.length > 16 ? context.normalize(out) : out;
}
