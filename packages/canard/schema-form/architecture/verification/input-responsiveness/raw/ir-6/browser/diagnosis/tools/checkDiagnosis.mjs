// Replays only retained diagnosis evidence; no browser, build, test, or formal window is started.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';

const base = path.resolve(
  'packages/canard/schema-form/architecture/verification/input-responsiveness/raw/ir-6/browser/diagnosis',
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(base, 'capture-manifest.json'), 'utf8'),
);
assert.equal(manifest.diagnosticOnly, true);
for (const [directory, records] of [
  [base, manifest.artifacts],
  [path.join(base, '../main'), manifest.formalInputs],
])
  for (const [name, expected] of Object.entries(records)) {
    const bytes = fs.readFileSync(path.join(directory, name));
    assert.equal(bytes.length, expected.bytes);
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      expected.sha256,
    );
  }
let files = 0;
for (const [run, info] of Object.entries(manifest.runs)) {
  const root = path.join(base, 'runs', run);
  for (const [name, expected] of Object.entries(info.files)) {
    const bytes = fs.readFileSync(path.join(root, name));
    assert.equal(bytes.length, expected.bytes, name);
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      expected.sha256,
      name,
    );
    files++;
  }
  const complete = JSON.parse(
    fs.readFileSync(path.join(root, 'diagnostic-complete.json'), 'utf8'),
  );
  assert.equal(complete.diagnosticOnly, true);
  assert.equal(complete.formalGateEvidence, false);
  assert.equal(
    complete.samples.length,
    complete.cases.length * complete.lanes.length * complete.count,
  );
  for (const sample of complete.samples) {
    const page = JSON.parse(
      gunzipSync(fs.readFileSync(path.join(root, sample.file))),
    );
    assert.equal(
      page.record.handlers.length,
      sample.id.startsWith('type-') ? 20 : 0,
    );
    assert.equal(page.record.mount.allDeferred, 0);
    assert.equal(page.record.mount.firstPaintedMs, sample.firstPaintedMs);
    assert.equal(page.record.mount.eagerPaintedMs, sample.eagerPaintedMs);
    if (complete.profile && !run.startsWith('preliminary')) {
      const prefix = sample.file.replace('.page.json.gz', '');
      const cpu = JSON.parse(
        gunzipSync(
          fs.readFileSync(path.join(root, prefix + '.cpuprofile.json.gz')),
        ),
      );
      const trace = JSON.parse(
        gunzipSync(fs.readFileSync(path.join(root, prefix + '.trace.json.gz'))),
      );
      const marker = trace.traceEvents.find(
        (event) => event.name === 'ir6-diagnostic-clock',
      );
      assert.equal(marker.ts, page.clock.traceUs);
      assert.equal(cpu.samples.length, cpu.timeDeltas.length);
      assert.ok(
        cpu.startTime / 1000 - page.clock.offsetMs <= page.record.start,
      );
      assert.ok(cpu.endTime / 1000 - page.clock.offsetMs >= page.record.end);
    }
  }
}
assert.equal(manifest.runs['profiles-mount'].countPerLaneRow, 5);
assert.equal(manifest.runs['profiles-burst'].countPerLaneRow, 5);
assert.equal(manifest.runs.variants.countPerLaneRow, 10);
assert.deepEqual(manifest.runs.variants.lanes, ['E', 'F', 'V1', 'V2', 'V3']);
for (const variant of ['v2', 'v3']) {
  const result = JSON.parse(
    gunzipSync(
      fs.readFileSync(path.join(base, variant + '-render-probe.json.gz')),
    ),
  );
  assert.equal(result.numPassedTests, 15);
  assert.equal(result.numFailedTests, 0);
}
execFileSync(process.execPath, [
  path.join(base, 'tools/analyzeFormalDiagnosis.mjs'),
]);
for (const run of [
  'profiles-mount',
  'profiles-burst',
  'profiles-flat500-verdict',
  'variants',
])
  execFileSync(process.execPath, [
    path.join(base, 'tools/analyzeCollectedDiagnosis.mjs'),
    '--input=' + path.join(base, 'runs', run),
  ]);
execFileSync(process.execPath, [
  path.join(base, 'tools/summarizeDiagnosis.mjs'),
]);
let columns;
for (const line of fs
  .readFileSync(path.join(base, 'diagnostic-tables.md'), 'utf8')
  .split('\n')) {
  if (!line.startsWith('|')) {
    columns = undefined;
    continue;
  }
  const count = line.split('|').length - 2;
  if (columns === undefined) columns = count;
  else assert.equal(count, columns, 'Markdown table columns stay aligned');
}
console.log(
  `IR6_DIAGNOSIS_CHECK_OK runs=${Object.keys(manifest.runs).length} boundFiles=${files} formalVerdictsUnchanged=true`,
);
