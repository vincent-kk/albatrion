// CLI probe of the canonical measurement function; no engine source is modified.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(here, '../tools/measure-verdict-95c01.mjs'), 'utf8');
const body = source.slice(source.indexOf('async function flushMicrotasks'), source.indexOf("if (process.argv.includes('--self-check'))"));
let time = 0;
const measure = new Function('clock', 'immediate', 'round', 'sentinelPasses', `${body}; return measure;`)(
  () => time += 0.001,
  callback => { time += 1; queueMicrotask(callback); },
  value => Number(value.toFixed(6)), 1);
const observed = await measure(() => {});
assert.equal(observed.timing[2], observed.timing[0], 'Check (a) endpoint must precede the harness sentinel');
assert(observed.timing[1] > observed.timing[0] + 0.9, 'FIFO diagnostic endpoint must still drain the queue');
console.log('SENTINEL_PLACEMENT_OK');
