/**
 * Preserve the JSON position of an item whose projected output is absent.
 * @param {object} context Runtime with the missing sentinel and shared empty object.
 * @param {object} node Item whose structural kind determines its empty placeholder.
 * @param {*} emitted Current projected item output, possibly the missing sentinel.
 * @returns {*} Emitted value, a matching empty container, or null for an empty leaf.
 */
export function projectArrayItem(context, node, emitted) {
  if (emitted !== context.MISSING) return emitted;
  if (node.kind === 'object') return context.EMPTY_LOCAL;
  if (node.kind === 'array') return context.EMPTY_KEYS;
  return null;
}
