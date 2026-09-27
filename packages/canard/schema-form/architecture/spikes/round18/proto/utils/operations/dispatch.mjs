/**
 * Dispatch within the supplied prototype execution context.
 * @param {object} context Isolated model state and explicitly wired operations.
 * @param {*} root root input accepted by the regression model.
 * @param {*} entries entries input accepted by the regression model.
 * @returns {*} The modeled operation result; mutating operations update this context.
 */
export function dispatch(context, root, entries) {
  if (root.dispatching) {
    for (let i = 0; i < entries.length; i++) root.waveQueue.push(entries[i]);
    return;
  }
  root.dispatching = true;
  context.lastSettle.waves = 0;
  context.lastSettle.wavesExceeded = false;
  context.lastSettle.delivered = [];
  context.lastSettle.errors = [];
  try {
    let wave = entries;
    for (;;) {
      context.lastSettle.waves++;
      context.counters.waves++;
      if (context.lastSettle.waves > context.WAVE_CAP) context.lastSettle.wavesExceeded = true;
      for (let i = 0; i < wave.length; i++) {
        const {
          node,
          payload
        } = wave[i];
        if (context.isDetached(node, root)) {
          node.signals = 0;
          continue;
        }
        node.revision++;
        node.signals = 0;
        context.counters.notifications++;
        if (context.trace) context.lastSettle.delivered.push({
          wave: context.lastSettle.waves,
          path: context.pathOf(node)
        });
        if (payload === null) continue;
        const listeners = node.listeners;
        if (listeners === null) continue;
        for (let k = 0; k < listeners.length; k++) {
          try {
            listeners[k](payload, node);
          } catch (e) {
            context.lastSettle.errors.push({
              path: context.pathOf(node),
              error: e
            });
          }
        }
      }
      if (root.waveQueue.length === 0) break;
      wave = root.waveQueue;
      root.waveQueue = [];
    }
  } finally {
    root.dispatching = false;
    root.settle.waves = context.lastSettle.waves;
    root.entryWaves += context.lastSettle.waves;
  }
  if (context.lastSettle.wavesExceeded) {
    root.settle.status = 'wave-cap-exceeded';
    if (root.options.dev) throw new Error(`wave cap exceeded: waves=${context.lastSettle.waves}`);
  }
}
