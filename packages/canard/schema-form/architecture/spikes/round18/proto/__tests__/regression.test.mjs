// filid:contract PROTO-REGRESSION
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runHistoricalProbe } from './utils/runHistoricalProbe.mjs';

test('the inherited 63 selfchecks pass in new mode with ledger-backed expectations', () => {
  const output = runHistoricalProbe('round9/regress/selfcheck-v5.mjs', ['new']);
  assert.equal(output.match(/^  PASS /gm)?.length, 63);
  assert.equal(output.includes('  FAIL '), false);
});

test('the inherited 63 selfchecks retain their historical level-mode coverage', () => {
  const output = runHistoricalProbe('round9/regress/selfcheck-v5.mjs', ['old']);
  assert.equal(output.match(/^  PASS /gm)?.length, 63);
  assert.equal(output.includes('  FAIL '), false);
});

test('Q8 checks fixed precedence and fresh reset edges across all 108 assertions', () => {
  const output = runHistoricalProbe('round9/r9.mjs');
  assert.deepEqual(JSON.parse(output.trim().split('\n').at(-1)).summary, { checks: 108, rows: 21, passed: true });
});

test('the 26 boundary assertions include unset precedence independently of stage order', () => {
  assert.deepEqual(JSON.parse(runHistoricalProbe('round9/regress/edge-cases.mjs')), { edgeCases: 26, passed: true });
});

test('the 52 corrected probes retain applied writes and retract only fill on exit', () => {
  const output = runHistoricalProbe('round9/r9b.mjs');
  assert.deepEqual(JSON.parse(output.trim().split('\n').at(-1)).summary, { checks: 52, probes: 13, failures: 0, passed: true });
});

test('r7 new-mode observations change only in four explained scenarios', () => {
  const output = runHistoricalProbe('round9/regress/r7-port.mjs', ['new']).trimEnd().split('\n');
  const historical = readFileSync(new URL('../../../round9/regress/r7port-new-output.txt', import.meta.url), 'utf8').trimEnd().split('\n');
  assert.equal(output.length, historical.length);
  let section = '';
  const changed = [];
  for (let index = 0; index < historical.length; index++) {
    if (/^[EXD]/.test(historical[index])) section = historical[index].split(' ')[0];
    if (historical[index] !== output[index]) changed.push(section);
  }
  assert.deepEqual(changed, ['E13', 'X3', 'X15', 'X15', 'X16', 'X16']);
  assert.match(output.find(line => line.startsWith('E13 ')), /getValue\(\) \{\}/);
  assert.equal(output.filter(line => line.includes('"retractions":1')).length, 2);
});

test('r7 historical old-mode changes only the VALUE-034 empty root and its port tally', () => {
  const output = runHistoricalProbe('round9/regress/r7-port.mjs', ['old']);
  const historical = readFileSync(new URL('../../../round9/regress/r7port-old-output.txt', import.meta.url), 'utf8');
  const expected = historical
    .replace('getValue() "<undefined>" raw {"a":""}', 'getValue() {} raw {"a":""}')
    .replace('26/28 lines identical', '25/28 lines identical')
    .trimEnd() + '\n  MISSING: E13 root {a}, user clears a to "" -> getValue() "<undefined>" raw {"a":""}';
  assert.equal(output.trimEnd(), expected);
});

test('r8 preserves 41 summaries except the four FRAGMENT-050 feedback outcomes', () => {
  const output = runHistoricalProbe('round9/regress/r8-port.mjs');
  const actual = output.trim().split('\n').map(line => JSON.parse(line.slice(8)));
  const expected = readFileSync(new URL('../../../round9/regress/r8port-output.txt', import.meta.url), 'utf8')
    .split('\n').filter(line => line.startsWith('SUMMARY ')).map(line => JSON.parse(line.slice(8)));
  let updated = 0;
  for (const row of expected) {
    if (row.probe !== 'P4' || !row.case.endsWith('/X16') || row.case.startsWith('OLD')) continue;
    Object.assign(row, { raw: { t: 'from-C' }, active: [], emit: { t: 'from-C' }, status: 'stable', budgetCommit: '',
      offFragmentAutoWrite: ['/t="from-C"'], wantedDefaultMissing: [], injectToOutOfDate: [], equalsNoDefaultSchema: false, equalsNoAutoSchema: false });
    updated++;
  }
  assert.equal(updated, 4);
  assert.equal(actual.length, 41);
  assert.deepEqual(actual, expected);
});

test('the v6 policy matrix remains executable as an explicitly historical experiment', () => {
  const result = JSON.parse(runHistoricalProbe('round10/r10.mjs'));
  assert.equal(result.combinations, 48);
  assert.equal(result.checks, 376);
});

test('the v6 policy observability probes preserve all ten historical assertions', () => {
  const result = JSON.parse(runHistoricalProbe('round10/policy-check.mjs'));
  assert.equal(result.assertions, 10);
  assert.ok(result.cases.every(row => row.passed));
});
