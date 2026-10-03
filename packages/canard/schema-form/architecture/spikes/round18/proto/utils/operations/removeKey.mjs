/**
 * Remove key within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} host host input accepted by the regression model.
 * @param {*} key key input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function removeKey(context, host, key) {
  const root = context.enter(host);
  let ok = false;
  try {
    context.noteCallerWrite(root, host);
    const extras = context.extrasOf(host);
    if (extras !== null && Object.hasOwn(extras, key)) {
      const next = {};
      for (const k of Object.keys(extras)) if (k !== key) next[k] = extras[k];
      host.pendingExtras = Object.keys(next).length === 0 ? null : next;
      host.hasPendingExtras = true;
      context.touch(host);
      context.autoSettle(host);
    }
    ok = true;
  } finally {
    context.leave(root, ok);
  }
}
