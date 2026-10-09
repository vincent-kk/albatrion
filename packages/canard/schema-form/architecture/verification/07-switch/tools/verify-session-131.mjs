// CLI artifact verification, not a timing verdict: check final JSON, raw hashes, block coverage and process sequencing.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { reportCluster129 } from './report-cluster-129.mjs';
import { annotateRow131 } from './annotate-row-131.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
for (const file of process.argv.slice(2)) {
  const session = JSON.parse(fs.readFileSync(file, 'utf8')), out = path.dirname(file);
  assert.equal(session.status, 'passed');
  assert(session.time.totalMs > 0 && session.time.totalMs < session.options.budgetSeconds * 1000);
  assert(session.preflight.fits);
  assert(session.preflight.requiredMs < session.preflight.budgetMs);
  for (const [index, process] of session.processes.entries()) {
    assert.equal(process.exitCode, 0); assert.equal(process.signal, null); assert.equal(process.bundlesLoaded, 1);
    assert(process.wallMs < 480000);
    assert(Date.parse(process.startedAt) <= Date.parse(process.endedAt));
    if (index) assert(Date.parse(session.processes[index - 1].endedAt) <= Date.parse(process.startedAt));
    for (const name of ['startToReadyMs', 'warmupMs', 'forcedGcMs', 'sampleMs', 'digestMs']) assert(Number.isFinite(process.time[name]) && process.time[name] >= 0);
    const batch = JSON.parse(fs.readFileSync(process.raw, 'utf8'));
    assert.equal(batch.bundlesLoaded, 1);
    for (const report of batch.reports) {
      assert(Object.keys(report.telemetry.gc).every(column => column.endsWith('-nogc')), 'Forced-GC columns carry no GC records');
      for (const [column, masks] of Object.entries(report.telemetry.gc))
        if (column.includes('mount')) assert(masks.every(mask => mask.writeWindows === 0 && mask.writeWindowsWithGc === 0), 'Mount rows have no write windows');
    }
  }
  for (const line of fs.readFileSync(path.join(out, 'sha256.txt'), 'utf8').trim().split('\n')) {
    const [digest, relative] = line.split('  ');
    assert.equal(hash(fs.readFileSync(path.join(out, relative))), digest, relative);
  }
  for (const row of session.report.rows) {
    if (session.kind !== 'confirm') assert.equal(row.blocks, session.scoping.find(scope => scope.key === row.key).blocks);
    const confirmation = session.report.confirmation?.rows.find(item => item.key === row.key);
    const annotated = annotateRow131(row, { scope: row.scope, reason: row.scopeReason }, confirmation);
    for (const field of ['confirmBlocks', 'confirmStatus', 'observation131']) assert.equal(row[field], annotated[field]);
    if (!row.mode.endsWith('-nogc')) {
      assert.equal(row.gcObservation, null, 'Forced-GC observations must be null');
      assert.equal(row.confirmGcObservation, null);
      continue;
    }
    for (const role of ['base', 'candidate']) {
      const gc = row.gcObservation[role];
      assert(gc.samples > 0 && gc.gcFreeSamples <= gc.samples);
      assert(gc.writeWindowGcFraction === null || (gc.writeWindowGcFraction >= 0 && gc.writeWindowGcFraction <= 1));
      assert(gc.gcFreeSamples ? Number.isFinite(gc.gcFreeMedian) : gc.gcFreeMedian === null);
      if (row.mode.includes('mount')) assert.equal(gc.writeWindowGcFraction, null);
    }
  }
  if (session.kind === 'aa') {
    const records = session.rawInputs.map(({ source, sha256 }) => {
      const bytes = fs.readFileSync(source); assert.equal(hash(bytes), sha256); return { source, record: JSON.parse(bytes) };
    });
    const replay = reportCluster129({ records });
    assert.deepEqual(replay.aaSummary, session.report.aaSummary);
    for (const row of replay.rows) {
      const saved = session.report.rows.find(item => item.key === row.key);
      assert.deepEqual(row.statistic, saved.statistic); assert.equal(row.correctionMs, saved.correctionMs);
    }
  }
  if (session.smoke) assert.equal(session.report.decision, 'SMOKE_NO_VERDICT');
  const observed = session.estimate.fixtures.filter(fixture => fixture.measuredFormRuns > 0);
  assert(observed.length);
  console.log(`VERIFY_SESSION_131_OK: ${session.lane}; ${session.processes.length} sequential processes; ${session.report.rows.length} rows; wall ${(session.time.totalMs / 1000).toFixed(3)}s; estimate ${(session.estimate.totalMs / 60000).toFixed(2)}min`);
}
