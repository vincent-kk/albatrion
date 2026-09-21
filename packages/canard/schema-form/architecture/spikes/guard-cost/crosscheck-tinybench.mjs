/**
 * Cross-check: the same guard calls measured with tinybench, to show the
 * hand-rolled batched harness is not inventing its numbers.
 *
 * The main harness batches an inner loop because tinybench times one `fn()` per
 * iteration, and at 5–60ns per guard that measures the timer as much as the
 * guard. tinybench is therefore expected to read HIGH on the cheap cases and to
 * converge with the harness as the operation grows past a microsecond.
 */
import { createRequire } from 'node:module';
import { ajvGuard, cfGuard, g1, host, itemsArray, g4, measure, monomorphicLoop, pool } from './lib.mjs';

const { Bench } = createRequire('/Users/Vincent/Workspace/albatrion/package.json')('tinybench');

const cases = [
  ['g1 ajv, host 10', ajvGuard(g1()), () => host(10, { kind: 'a' })],
  ['g1 ajv, host 1000', ajvGuard(g1()), () => host(1000, { kind: 'a' })],
  ['g1 cfworker, host 1000', cfGuard(g1()), () => host(1000, { kind: 'a' })],
  ['g4 ajv, 10000 items, no match', ajvGuard(g4), () => host(100, { items: itemsArray(10000, -1) })],
  ['g4 cfworker, 10000 items, no match', cfGuard(g4), () => host(100, { items: itemsArray(10000, -1) })],
];

const bench = new Bench({ time: 1000, warmupTime: 500 });
const harness = new Map();

for (const [name, fn, build] of cases) {
  const values = pool(build, 2);
  harness.set(name, measure(monomorphicLoop(fn, values), { warmupMs: 1500, samples: 9 }).medianNs);
  let i = 0;
  bench.add(name, () => {
    if (fn(values[i++ & 1])) globalThis.__sink = (globalThis.__sink ?? 0) + 1;
  });
}

await bench.run();

console.log('| case | batched harness | tinybench | ratio |');
console.log('| --- | --- | --- | --- |');
for (const task of bench.tasks) {
  // tinybench reports latency in milliseconds; `latency` is v3, `mean` is v2.
  const result = task.result;
  const meanMs = result.latency ? result.latency.mean : result.mean;
  const tbNs = meanMs * 1e6;
  const ours = harness.get(task.name);
  console.log(
    `| ${task.name} | ${ours.toFixed(1)} ns | ${tbNs.toFixed(1)} ns | ${(tbNs / ours).toFixed(2)}× |`,
  );
}
