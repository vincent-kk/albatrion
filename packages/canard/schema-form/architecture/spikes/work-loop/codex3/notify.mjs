/** Deliver queued immutable payloads, while synchronous writes immediately update the live value. */
export function notify() {
  let current = { n: 1 };
  const queue = [current];
  const observations = [];
  for (let wave = 0; wave < queue.length; wave++) {
    const payload = queue[wave];
    for (const listener of ['first', 'second', 'third']) {
      observations.push({ wave: wave + 1, listener, payload: payload.n, value: current.n });
      if (wave === 0 && listener === 'first') {
        current = { n: 2 };
        queue.push(current);
      }
    }
  }
  return observations;
}
