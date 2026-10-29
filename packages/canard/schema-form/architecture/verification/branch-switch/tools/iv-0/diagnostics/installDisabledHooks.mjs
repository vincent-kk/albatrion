/**
 * Install inert import-time hooks before evaluating an instrumented engine.
 * @param {any} target - The worker's globalThis object
 * @returns Nothing; import-time module allocations remain outside write counts
 */
export function installDisabledHooks(target) {
  const noop = () => {};
  target.__iv = Object.fromEntries(
    [
      'begin',
      'end',
      'context',
      'scratch',
      'allocate',
      'compute',
      'computeEnd',
      'roundStart',
      'roundEnd',
      'inject',
      'settled',
    ].map((name) => [name, noop]),
  );
  target.__b0 = { enter: noop, exit: noop, enterCreation: noop };
}
