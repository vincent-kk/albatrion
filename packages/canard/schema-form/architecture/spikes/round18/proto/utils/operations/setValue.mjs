/**
 * Set value within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @param {*} mode mode input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function setValue(context, node, value, mode = 'Overwrite') {
  const loadOptions = typeof mode === 'object' ? mode : {};
  mode = loadOptions.mode ?? (typeof mode === 'string' ? mode : 'Overwrite');
  const root = context.enter(node);
  if (mode !== 'Merge' && node.kind !== 'leaf') root.loadSuppressed ||= loadOptions.disableAutomaticWrites ?? root.options.disableAutomaticWrites;
  let ok = false;
  try {
    context.noteCallerWrite(root, node);
    const load = mode !== 'Merge' && node.kind !== 'leaf';
    if (load) context.loadDepth++;
    context.stagingDepth++;
    try {
      context.applyValue(node, value, mode === 'Merge');
      if (mode === 'Merge') context.clearNonObjectAncestors(node);
    } finally {
      context.stagingDepth--;
      if (load) context.loadDepth--;
    }
    context.autoSettle(node);
    ok = true;
  } finally {
    context.leave(root, ok);
  }
}
