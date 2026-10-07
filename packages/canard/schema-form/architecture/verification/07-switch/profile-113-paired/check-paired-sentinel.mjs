// CLI regression check: executes the canonical clock function with deterministic queue delays.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, '../tools/measure-verdict-95c01.mjs'), 'utf8');
const body = source.slice(source.indexOf('async function flushMicrotasks'), source.indexOf("if (process.argv.includes('--self-check'))"));
for (const passes of [1, 2]) {
  let time = 0, sentinels = 0;
  const immediate = callback => { sentinels++; setImmediate(() => { time += 1; callback(); }); };
  const measure = new Function('clock', 'immediate', 'round', 'sentinelPasses', `${body}; return measure;`)(
    () => time += .001, immediate, value => Number(value.toFixed(6)), passes);
  const empty = await measure(() => {});
  assert.equal(sentinels, passes * 2, 'Each sample must have a separately measured paired empty sentinel');
  assert(Math.abs(empty.timing[1] - empty.timing[0] - empty.timing[2]) < 1e-9);
  const delayed = await measure(() => queueMicrotask(() => immediate(() => { time += 5; })));
  assert(delayed.timing[1] - delayed.timing[0] - delayed.timing[2] > 4.9,
    'Paired subtraction must preserve engine work between the clocks');
}
console.log('PAIRED_SENTINEL_REGRESSION_OK');
