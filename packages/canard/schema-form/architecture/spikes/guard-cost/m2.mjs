/**
 * M2 — total Resolve cost of one write when N guards all sit on the root object
 * and all are re-evaluated, versus the two devices the current implementation
 * uses: `new Function`-compiled expressions and the O(1) equality index.
 *
 * The guard loop uses one shared call site over an array of compiled functions,
 * which is what a real Resolve pass looks like — megamorphic for Ajv (N distinct
 * generated functions), monomorphic for cfworker (one closure shape).
 */
import { ajvGuard, cfGuard, environment, host, measure, pool, writeResult } from './lib.mjs';

const COUNTS = [10, 50, 200];
const FILLERS = 20;

/** Root object carrying N discriminators plus unrelated filler keys. */
function makeRoot(n) {
  const root = host(FILLERS);
  for (let i = 0; i < n; i++) root[`kind_${i}`] = i % 2 === 0 ? 'a' : 'z';
  return root;
}

/** N single-property guard schemas, one per discriminator. */
function guardSchemas(n) {
  return Array.from({ length: n }, (_, i) => ({
    properties: { [`kind_${i}`]: { const: 'a' } },
    required: [`kind_${i}`],
  }));
}

/** Timed loop over a pool of roots, evaluating every guard in `fns` per write. */
function evaluateAllLoop(fns, roots) {
  const mask = roots.length - 1;
  return function loop(writes) {
    let checksum = 0;
    for (let w = 0; w < writes; w++) {
      const root = roots[w & mask];
      for (let g = 0; g < fns.length; g++) if (fns[g](root)) checksum++;
    }
    return checksum;
  };
}

const rows = [];

for (const n of COUNTS) {
  const roots = pool(() => makeRoot(n));
  const schemas = guardSchemas(n);
  const keys = schemas.map((_, i) => `kind_${i}`);

  const mechanisms = {
    ajv: evaluateAllLoop(schemas.map(ajvGuard), roots),
    cfworker: evaluateAllLoop(schemas.map(cfGuard), roots),
  };

  // (a) current mechanism: N expressions compiled with `new Function`.
  const expressions = keys.map(() =>
    new Function('dependencies', 'return dependencies[0]==="a"'),
  );
  // One pool entry per write slot: values identical, references distinct, so
  // the inner loop stays "already materialized" without being loop-invariant
  // (V8 would otherwise hoist the whole call out and measure nothing).
  const depsPool = pool(() => keys.map((k) => [roots[0][k]]));
  mechanisms['newFunction (deps prebuilt)'] = (() => {
    const mask = roots.length - 1;
    return function loop(writes) {
      let checksum = 0;
      for (let w = 0; w < writes; w++) {
        const deps = depsPool[w & mask];
        for (let g = 0; g < expressions.length; g++) {
          if (expressions[g](deps[g])) checksum++;
        }
      }
      return checksum;
    };
  })();

  const scratch = keys.map(() => [undefined]);
  mechanisms['newFunction (deps re-read)'] = (() => {
    const mask = roots.length - 1;
    return function loop(writes) {
      let checksum = 0;
      for (let w = 0; w < writes; w++) {
        const root = roots[w & mask];
        for (let g = 0; g < expressions.length; g++) {
          const slot = scratch[g];
          slot[0] = root[keys[g]];
          if (expressions[g](slot)) checksum++;
        }
      }
      return checksum;
    };
  })();

  // (b) current mechanism: one O(1) dictionary lookup decides the branch.
  const index = new Map([['a', 1], ['z', 2]]);
  mechanisms['O(1) index lookup'] = (() => {
    const mask = roots.length - 1;
    return function loop(writes) {
      let checksum = 0;
      for (let w = 0; w < writes; w++) checksum += index.get(roots[w & mask].kind_0);
      return checksum;
    };
  })();

  for (const [mechanism, loop] of Object.entries(mechanisms)) {
    const stats = measure(loop);
    rows.push({
      n,
      mechanism,
      usPerWrite: stats.medianNs / 1000,
      nsPerGuard: mechanism === 'O(1) index lookup' ? null : stats.medianNs / n,
      ...stats,
    });
    process.stderr.write(`N=${n} ${mechanism}: ${(stats.medianNs / 1000).toFixed(3)}us/write\n`);
  }
}

console.log(writeResult('m2', { environment: environment(), rows, fillers: FILLERS }));
