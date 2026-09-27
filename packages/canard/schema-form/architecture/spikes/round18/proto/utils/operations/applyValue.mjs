/**
 * Apply value within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} node node input accepted by the regression model.
 * @param {*} value value input accepted by the regression model.
 * @param {*} merge merge input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function applyValue(context, node, value, merge) {
  if (context.loadDepth > 0 && node.isSource) context.markSourceLoaded(node);
  if (node.isSource && context.inSettle === false) context.markSourceWritten(node);
  context.markPresent(node);
  if (node.kind === 'leaf') {
    context.stageRaw(node, value);
    return;
  }
  const isArray = node.kind === 'array';
  const wrongKind = value === null || typeof value !== 'object' || Array.isArray(value) !== isArray;
  if (wrongKind) {
    context.stageRaw(node, value);
    if (isArray === false) {
      node.pendingExtras = null;
      node.hasPendingExtras = true;
    }
    context.markReplaced(node);
    const kids = node.children;
    for (let i = 0; i < kids.length; i++) context.erase(kids[i]);
    return;
  }
  if (context.rawOf(node) !== undefined) context.stageRaw(node, undefined);else context.touch(node);
  if (isArray) {
    context.applyArray(node, value);
    return;
  }
  if (merge === false) {
    context.markReplaced(node);
    let extras = null;
    for (const key in value) {
      if (node.index.has(key)) continue;
      if (extras === null) extras = {};
      extras[key] = value[key];
    }
    if (extras !== null || context.extrasOf(node) !== null) {
      node.pendingExtras = extras;
      node.hasPendingExtras = true;
    }
  } else {
    let extras = context.extrasOf(node);
    let touched = false;
    for (const key in value) {
      if (node.index.has(key)) continue;
      if (touched === false) {
        extras = extras === null ? {} : {
          ...extras
        };
        touched = true;
      }
      extras[key] = value[key];
    }
    if (touched) {
      node.pendingExtras = extras;
      node.hasPendingExtras = true;
    }
  }
  const kids = node.children;
  for (let i = 0; i < kids.length; i++) {
    const child = kids[i];
    if (Object.hasOwn(value, child.name)) context.applyValue(child, value[child.name], merge);else if (merge === false) context.erase(child);
  }
}
