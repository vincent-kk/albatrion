/**
 * M1 addendum — the `contains` guard (g4) measured in a fresh process.
 *
 * In the full M1 sweep this case runs after ~100 other measurements, and
 * cfworker's allocation rate makes it sensitive to the heap it inherits: the
 * same configuration read 9.7 ms there and 4.5 ms here. The isolated figure is
 * the one the report quotes; the gap is itself a finding about that validator.
 */
import {
  ajvGuard,
  cfGuard,
  environment,
  g4,
  host,
  itemsArray,
  measure,
  monomorphicLoop,
  pool,
  writeResult,
} from './lib.mjs';

const rows = [];
for (const [verdictLabel, matchIndex] of [['early match at 0', 0], ['no match', -1]]) {
  for (const count of [100, 1000, 10000]) {
    const values = pool(() => host(100, { items: itemsArray(count, matchIndex) }), 2);
    for (const [validator, compile] of [['ajv', ajvGuard], ['cfworker', cfGuard]]) {
      const stats = measure(monomorphicLoop(compile(g4), values), { warmupMs: 2000, samples: 11 });
      rows.push({ verdictLabel, count, validator, ...stats });
      process.stderr.write(
        `${verdictLabel} n=${count} ${validator}: ${(stats.medianNs / 1000).toFixed(1)}us\n`,
      );
    }
  }
}

console.log(writeResult('m1-contains', { environment: environment(), rows }));
