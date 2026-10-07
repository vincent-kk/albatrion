// Execute the canonical reporter's validation loop for a measured row, without its full-session gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { endpointDifference95c01 } from '../tools/endpointDifference95c01.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(here);
const manifest = JSON.parse(fs.readFileSync(path.join(here, 'array-manifest.json'), 'utf8'));
const records = manifest.records.filter(r => r.fixture === 'array-100');
const data = new Map(records.map(r => [r.timingFile, JSON.parse(fs.readFileSync(path.join(D, r.timingFile), 'utf8'))]));
const source = fs.readFileSync(path.join(D, 'tools/report-verdict-95c01.mjs'), 'utf8');
const metricSource = source.slice(source.indexOf('const metric ='), source.indexOf('const counts ='));
const bootstrapSource = source.slice(source.indexOf('function bootstrap('), source.indexOf('const emptyEndCi ='));
const controls = records.flatMap(r => ['empty-before', 'empty-after'].flatMap(mode => data.get(r.timingFile)[mode]));
const calculate = new Function('assert', 'records', 'data', 'controls', 'endpointDifference95c01', `
  ${metricSource}
  ${bootstrapSource}
  const waiting = controls.map(row => row[1] - row[0]), waitMedian = metric(waiting).median;
  const selected = { emptyEndToEnd: metric(controls.map(row => row[1])), emptyMicrotask: metric(controls.map(row => row[0])),
    wait: { p95AbsoluteDeviationMs: percentile(waiting.map(value => Math.abs(value - waitMedian)), .95) },
    bootstrap99: { emptyEnd: bootstrap(controls.map(row => row[1]), 9501), emptyMicrotask: bootstrap(controls.map(row => row[0]), 9502) } };
  const calibration = { bySentinelPasses: { 1: selected } };
  ${source.slice(source.indexOf('const validationRows = []'), source.indexOf('const makeRow ='))}
  return { rows: validationRows, evaluated };
`);
const result = calculate(assert, records, data, controls, endpointDifference95c01);
const row = result.rows.find(r => r.mode === 'update');
assert(row.a.withinNoise && row.a.allRunsWithinNoise);
assert.equal(row.a.differenceMs, 0);
assert.equal(result.evaluated.get('array-100/off/update').new.source, 'sentinel', 'Official ratio source is preserved');
for (const record of records) {
  assert.equal(record.workerExit.code, 0); assert.equal(record.workerExit.signal, null);
  assert.deepEqual(record.checks, records.find(p => p.run === record.run && p.version !== record.version).checks);
}
console.log(JSON.stringify({ result: 'CANONICAL_ROW_END_TO_END_OK', row: 'array-100/off/update',
  checkA: row.a, oldFallback: row.oldFallback, processes: records.length, natural: true }));
