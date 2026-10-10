/**
 * Reset counters within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function resetCounters(context) {
  for (const k of Object.keys(context.counters)) context.counters[k] = 0;
}
