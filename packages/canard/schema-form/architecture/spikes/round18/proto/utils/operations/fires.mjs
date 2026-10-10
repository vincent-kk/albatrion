/**
 * Fires within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} rule rule input accepted by the regression model.
 * @param {*} e e input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function fires(context, rule, e) {
  const src = rule.from;
  if (src.loaded && context.SWITCHES.LOAD_EDGE !== 'ref') {
    const mode = context.SWITCHES.LOAD_EDGE;
    if (mode === 'skip') return false;
    if (mode === 'fill') {
      const entry = src.root.autoLog.get(rule.to);
      return entry !== undefined && entry.rule === rule ? entry.baseAbsent : context.isAbsent(rule.to);
    }
    return e !== context.MISSING;
  }
  const ref = context.SWITCHES.EDGE_REF === 'entry' && src.edgeRefEntry === src.root.entryId ? src.edgeRef : src.emit;
  if (context.SWITCHES.EDGE_COMPARE === 'write' && src.srcWritten) return true;
  return context.sameValue(e, ref) === false;
}
