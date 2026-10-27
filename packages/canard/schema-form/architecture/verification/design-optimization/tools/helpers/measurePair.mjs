import { performance } from 'node:perf_hooks';
import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

import { setupOperation } from './setupOperation.mjs';

/** Measure one same-process pair with alternating import/execution order and untimed timer yields. */
export async function measurePair(row, config, engines, repeat) {
  const prepared = {};
  const engineNames = row.currentOnly ? ['current'] : ['legacy', 'current'];
  for (const engine of engineNames)
    prepared[engine] = await setupOperation(
      row,
      engine,
      await import(pathToFileURL(engines[engine].destination)),
    );
  for (const engine of engineNames) await prepared[engine].preflight?.();
  const samples = { legacy: [], current: [] };
  const orders = [];
  for (let i = -config.warmups; i < config.samples; i++) {
    const order = row.currentOnly
      ? ['current']
      : (i + config.warmups + repeat) % 2
        ? ['current', 'legacy']
        : ['legacy', 'current'];
    if (i >= 0) orders.push(order.join(','));
    for (const engine of order) {
      await setTimeout(0);
      await import(pathToFileURL(engines[engine].destination));
      const start = performance.now();
      const result = prepared[engine].run();
      if (result?.then) await result;
      const elapsed = performance.now() - start;
      prepared[engine].check();
      if (i >= 0) samples[engine].push(elapsed);
    }
  }
  return {
    row: row.id,
    repeat,
    pid: process.pid,
    orders,
    samples,
    minima: {
      legacy: row.currentOnly ? null : Math.min(...samples.legacy),
      current: Math.min(...samples.current),
    },
  };
}
