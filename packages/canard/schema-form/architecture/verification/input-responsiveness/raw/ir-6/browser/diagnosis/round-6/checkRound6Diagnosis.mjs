// Run from repository root; only reads archived diagnostic samples and never runs a browser.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

const directory = new URL('./', import.meta.url);
const read = (name) => {
  const bytes = fs.readFileSync(new URL(name, directory));
  return JSON.parse(name.endsWith('.gz') ? gunzipSync(bytes) : bytes.toString('utf8'));
};
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifest = read('capture-manifest.json');
assert.equal(manifest.diagnosticOnly, true);
assert.equal(manifest.formalGateEvidence, false);
for (const [name, hash] of Object.entries(manifest.files))
  assert.equal(digest(fs.readFileSync(new URL(name, directory))), hash, name);
assert.equal(digest(fs.readFileSync(new URL(manifest.runner, directory))), manifest.runnerSha256);
const complete = read('diagnostic-complete.json.gz');
const summary = read('summary.json');
const inputs = read('inputs.json.gz');
const start = read('diagnostic-start.json');
assert.equal(complete.diagnosticOnly, true);
assert.equal(complete.formalGateEvidence, false);
assert.equal(complete.profile, false);
assert.equal(complete.warmup, 3);
assert.equal(complete.count, 10);
assert.equal(complete.samples.length, 80);
assert.deepEqual(complete.lanes, ['E', 'F-old', 'F-new', 'V1']);
assert.deepEqual(complete.inputs, inputs);
assert.equal(digest(gunzipSync(fs.readFileSync(new URL('inputs.json.gz', directory)))), start.inputsSha256);
assert.equal(summary.head, manifest.measuredHead);
assert.equal(summary.diagnosticOnly, true);
assert.equal(summary.formalGateEvidence, false);
const rows = [];
for (const id of complete.cases) {
  const medians = {};
  for (const lane of complete.lanes) {
    const samples = complete.samples.filter((sample) => sample.id === id && sample.lane === lane);
    assert.deepEqual(samples.map((sample) => sample.index).sort((a, b) => a - b), Array.from({ length: 10 }, (_, i) => i));
    for (const sample of samples) {
      const page = read(sample.file);
      assert.equal(page.diagnosticOnly, true);
      assert.equal(page.record.mount.allDeferred, 0);
      assert.equal(page.record.handlers.length, 0);
      assert.equal(page.record.mount.firstPaintedMs, sample.firstPaintedMs);
      assert.equal(page.record.mount.eagerPaintedMs, sample.eagerPaintedMs);
    }
    medians[lane] = {};
    for (const metric of ['firstPaintedMs', 'eagerPaintedMs']) {
      const values = samples.map((sample) => sample[metric]).sort((a, b) => a - b);
      medians[lane][metric] = (values[4] + values[5]) / 2;
    }
  }
  const changes = {};
  for (const metric of ['firstPaintedMs', 'eagerPaintedMs'])
    changes[metric] = {
      'F-new/E': medians['F-new'][metric] / medians.E[metric],
      'F-new-V1': medians['F-new'][metric] - medians.V1[metric],
      'F-new-F-old': medians['F-new'][metric] - medians['F-old'][metric],
    };
  rows.push({ id, medians, changes, newEagerAboveOld: medians['F-new'].eagerPaintedMs > medians['F-old'].eagerPaintedMs });
}
assert.deepEqual(rows, summary.rows);
const table = ['| 모드 | 중앙값(ms) | E | F-old | F-new | V1 | F-new/E | F-new−V1(ms) | F-new−F-old(ms) |', '|---|---|---:|---:|---:|---:|---:|---:|---:|'];
for (const row of rows)
  for (const [metric, label] of [['firstPaintedMs', 'first'], ['eagerPaintedMs', 'eager']]) {
    const change = row.changes[metric];
    table.push('| ' + (row.id.endsWith('-none') ? 'None' : 'OnChange') + ' | ' + label + ' | ' + ['E', 'F-old', 'F-new', 'V1'].map((lane) => row.medians[lane][metric].toFixed(3)).join(' | ') + ' | ' + change['F-new/E'].toFixed(6) + ' | ' + change['F-new-V1'].toFixed(3) + ' | ' + change['F-new-F-old'].toFixed(3) + ' |');
  }
const rendered = table.join('\n') + '\n';
assert.equal(fs.readFileSync(new URL('tables.md', directory), 'utf8'), rendered);
const report = fs.readFileSync('packages/canard/schema-form/architecture/verification/input-responsiveness/ir-6-results.md', 'utf8');
assert.ok(report.includes('<!-- IR6_R6_DIAG_TABLES:START -->\n' + rendered + '<!-- IR6_R6_DIAG_TABLES:END -->'));
console.log('IR6_ROUND6_DIAGNOSIS_OK pages=80 warmups=24 diagnosticOnly=true formalGateEvidence=false');
