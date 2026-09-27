/**
 * Leave within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} ok ok input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function leave(context, root, ok) {
  if (--root.entryDepth !== 0) return;
  context.endEntryScope(root);
  context.counters.entries++;
  context.lastEntry.settles = root.entrySettles;
  context.lastEntry.waves = root.entryWaves;
  context.lastEntry.commit = root.commitNumber;
  context.lastEntry.onChangeDepth = root.onChangeDepth;
  context.lastEntry.onChange = false;
  context.lastEntry.validation = false;
  context.lastEntry.onChangeCapExceeded = false;
  context.lastEntry.aborted = ok === false;
  if (ok === false) return;
  const previous = root.entryEmit;
  const current = root.emit;
  if (previous === current) return;
  if (root.onValidate !== null) {
    context.counters.validations++;
    context.lastEntry.validation = true;
    try {
      root.onValidate(root.commitNumber);
    } catch (e) {
      context.lastSettle.errors.push({
        path: '/',
        error: e
      });
    }
  }
  if (root.onChange === null) return;
  if (root.onChangeDepth >= context.WAVE_CAP) {
    context.lastEntry.onChangeCapExceeded = true;
    root.settle.status = 'onchange-cap-exceeded';
    if (root.options.dev) {
      const err = new Error(`onChange cap exceeded: depth=${root.onChangeDepth}`);
      err.onChangeCap = true;
      throw err;
    }
    return;
  }
  context.counters.onChange++;
  context.lastEntry.onChange = true;
  root.onChangeDepth++;
  try {
    root.onChange(context.valueOf(root), {
      previous: context.valueOrUndefined(previous),
      current: context.valueOf(root),
      commit: root.commitNumber
    });
  } catch (e) {
    if (e !== null && typeof e === 'object' && e.onChangeCap === true) throw e;
    context.lastSettle.errors.push({
      path: '/',
      error: e
    });
  } finally {
    root.onChangeDepth--;
  }
}
