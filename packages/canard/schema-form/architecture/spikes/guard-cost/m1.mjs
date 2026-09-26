/**
 * M1 — isolated cost of one guard call, Ajv vs @cfworker/json-schema,
 * across guard shapes, host widths and both verdicts.
 *
 * Each case gets its own generated loop (`monomorphicLoop`) so the guard call
 * sits at a fresh inline-cache site: this is the best case for a single guard,
 * not the megamorphic dispatch a real N-guard Resolve pass produces (see M2).
 */
import {
  ajvGuard,
  cfGuard,
  environment,
  g1,
  g2,
  g3,
  g4,
  g5,
  host,
  itemsArray,
  measure,
  monomorphicLoop,
  pool,
  writeResult,
} from './lib.mjs';

const HOST_WIDTHS = [10, 100, 1000];
const cases = [];

/**
 * Register one (shape, host width, verdict) case.
 * @param {() => object} makeValue builds one instance; called repeatedly for the pool
 */
function addCase(shape, schema, siblings, verdict, makeValue, note = '') {
  cases.push({ shape, siblings, verdict, schema, makeValue, note });
}

for (const siblings of HOST_WIDTHS) {
  addCase('g1 single const', g1(), siblings, true, () => host(siblings, { kind: 'a' }));
  addCase('g1 single const', g1(), siblings, false, () => host(siblings, { kind: 'z' }));

  addCase('g2 conjunction x3', g2, siblings, true,
    () => host(siblings, { kind: 'a', mode: 'x', level: 'hi' }));
  addCase('g2 conjunction x3', g2, siblings, false,
    () => host(siblings, { kind: 'a', mode: 'x', level: 'lo' }), 'fails on 3rd property');

  addCase('g3 depth-3 hoisted', g3, siblings, true,
    () => host(siblings, { a: { b: { kind: 'x' }, pad: 1 } }));
  addCase('g3 depth-3 hoisted', g3, siblings, false,
    () => host(siblings, { a: { b: { kind: 'y' }, pad: 1 } }));

  addCase('g5 not(anyOf x2)', g5, siblings, true,
    () => host(siblings, { kind: 'z', mode: 'z' }), 'both branches scanned');
  addCase('g5 not(anyOf x2)', g5, siblings, false,
    () => host(siblings, { kind: 'a', mode: 'z' }), 'anyOf short-circuits on 1st');
}

// g4 scans an array, so array length dominates; host width is pinned at 100.
for (const count of [100, 1000, 10000]) {
  addCase(`g4 contains n=${count}`, g4, 100, true,
    () => host(100, { items: itemsArray(count, 0) }), 'early match at index 0');
  addCase(`g4 contains n=${count}`, g4, 100, false,
    () => host(100, { items: itemsArray(count, -1) }), 'no match, full scan');
}

const rows = [];

// Loop overhead floor: a guard that does nothing, through the same harness.
const floor = measure(monomorphicLoop(() => true, pool(() => host(10, { kind: 'a' }))));
rows.push({ shape: 'loop overhead floor', siblings: 10, verdict: true, validator: 'none', note: 'trivial () => true', ...floor });

for (const c of cases) {
  // Long arrays are memory-heavy; keep the pool small there.
  const poolSize = c.shape.includes('n=10000') ? 2 : 8;
  const values = pool(c.makeValue, poolSize);
  for (const [validator, compile] of [['ajv', ajvGuard], ['cfworker', cfGuard]]) {
    const fn = compile(c.schema);
    if (fn(values[0]) !== c.verdict) {
      throw new Error(`verdict mismatch: ${validator} ${c.shape} siblings=${c.siblings}`);
    }
    const stats = measure(monomorphicLoop(fn, values));
    rows.push({
      shape: c.shape,
      siblings: c.siblings,
      verdict: c.verdict,
      validator,
      note: c.note,
      ...stats,
    });
    process.stderr.write(
      `${c.shape} s=${c.siblings} ${c.verdict} ${validator}: ${stats.medianNs.toFixed(1)}ns\n`,
    );
  }
}

console.log(writeResult('m1', { environment: environment(), rows, floorNs: floor.medianNs }));
