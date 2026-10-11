// CLI audit; raw medians and seeded intervals are recomputed independently of the row analyzer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, rawDirectory, scratch, HEAD, hash, emitSummary } from './runtime.mjs';

const rawFiles = fs.readdirSync(rawDirectory).filter(file => file.endsWith('.json')).sort();
if (process.argv[2] === '--manifest') {
  const begin = Number(process.argv[3]), count = Number(process.argv[4]);
  const lines = rawFiles.slice(begin, begin + count).map(file => hash(fs.readFileSync(path.join(rawDirectory, file))) + '  ' + path.join(rawDirectory, file));
  emitSummary('manifest-part', { total: rawFiles.length, begin, text: lines.join('\n') + '\n' });
} else {
  const bundles = JSON.parse(fs.readFileSync(path.join(directory, 'bundles.json'), 'utf8')).results;
  const hashes = Object.fromEntries(bundles.map(row => [row.variant, row.sha256]));
  const verdicts = ['1b', '2'].map(stage => JSON.parse(fs.readFileSync(path.join(directory, 'verdict-' + stage + '.json'), 'utf8')));
  assert.equal(verdicts[0].verdict, 'REJECT'); assert.equal(verdicts[1].baseVariant, 'head'); assert.equal(verdicts[1].candidateVariant, '2');
  const intervals = [];
  const measuredWindows = [], endpointExcluded = [], selectedRows = [];
  let coreRecords = 0, medianChecks = 0, axisSumChecks = 0;
  for (const stage of ['AA', '1b', '2']) {
    const analyses = fs.readdirSync(directory).filter(file => file.startsWith('analysis-' + stage + '-') && file.endsWith('.json'));
    assert.equal(analyses.length, 23);
    const calibration = JSON.parse(fs.readFileSync(path.join(directory, 'calibration-' + stage + '.json'), 'utf8')).byPasses;
    let rowCount = 0;
    for (const file of analyses) {
      const analysis = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
      const records = analysis.raw.map(name => JSON.parse(fs.readFileSync(path.join(rawDirectory, name), 'utf8')));
      assert.equal(records.length, 9); coreRecords += 9;
      for (const record of records) {
        assert.equal(record.HEAD, HEAD); assert.equal(record.warmup, 20); assert.equal(record.samples, 101);
        assert(record.forcedGCOutsideClock && record.freshProcess && !record.officialEngineInstrumentation && !record.negativeClipping);
        assert.equal(record.bundleSha256.base, hashes.head);
        assert.equal(record.bundleSha256.candidate, hashes[stage === 'AA' ? 'head' : stage]);
        assert.equal(record.empty.before.length, 101); assert.equal(record.empty.after.length, 101);
        measuredWindows.push({ file: stage + '/' + record.fixture + '/' + record.validation + '/' + record.run,
          start: Date.parse(record.started), end: Date.parse(record.ended), seconds: record.seconds });
        for (const version of ['base', 'candidate']) {
          for (const [mode, values] of Object.entries(record.timing[version])) {
            assert.equal(values.length, 101); assert(values.every(row => row.length === 3 && row.every(Number.isFinite)));
            assert.deepEqual(record.checks.base[mode], record.checks.candidate[mode]);
            for (const key of ['scheduled', 'executed', 'pendingAtMicrotasks', 'pendingAtSentinel', 'tailScheduled', 'tailExecuted'])
              assert.equal(record.boundary[version][mode][key].max, 0);
            if (mode === 'axis-update') for (let index = 0; index < 101; index++) {
              const first = record.timing[version]['axis-first'][index], later = record.timing[version]['axis-later'][index];
              for (let column = 0; column < 3; column++) assert(Math.abs(values[index][column] - first[column] - later[column]) < 1.1e-6);
              axisSumChecks++;
            }
          }
        }
      }
      for (const row of analysis.rows) {
        rowCount++; medianChecks++;
        assert.equal(row.versions.base.selected, 'sentinel'); assert.equal(row.versions.candidate.selected, 'sentinel');
        const k = row.mode === 'update' ? records[0].interactionCount : row.mode === 'axis-update' ? 2 : 1;
        assert.equal(k, row.callCount);
        const C = calibration[records[0].sentinelPasses].C;
        const deltas = records.flatMap(record => record.timing.base[row.mode].map((value, index) =>
          (value[1] - k * C) - (record.timing.candidate[row.mode][index][1] - k * C)));
        assert.equal(deltas.length, 909);
        const sorted = deltas.toSorted((a, b) => a - b);
        assert(Math.abs(sorted[454] - row.paired.median) < 1e-12);
        const excluded = row.mode === 'mount' && row.validation === 'off' && ['sample-0', 'sample-1', 'sample-2', 'flat-50'].includes(row.fixture);
        if (excluded) endpointExcluded.push(stage + '/' + row.fixture + '/' + row.validation + '/' + row.mode);
        else assert(Object.values(row.versions).every(version => version.endpointCheck.passed));
        const verdict = verdicts.find(value => value.stage === stage);
        if (verdict) {
          const selected = verdict.rows.find(value => value.fixture === row.fixture && value.validation === row.validation && value.mode === row.mode);
          assert(selected && selected.eligible === !excluded);
          const aaFile = JSON.parse(fs.readFileSync(path.join(directory, 'analysis-AA-' + row.fixture + '-' + row.validation + '.json'), 'utf8'));
          const aa = aaFile.rows.find(value => value.mode === row.mode);
          assert(Math.abs(selected.regressionFloorMs - Math.max(Math.abs(aa.paired.median), Math.abs(selected.baseMedianMs) * .005)) < 1e-12);
          assert.equal(selected.regression, selected.paired.high < 0 && Math.abs(selected.paired.median) > selected.regressionFloorMs);
          selectedRows.push(selected);
          if (selected.regression && selected.eligible || row.mode.startsWith('axis-')) intervals.push({ key: stage + '/' + row.fixture + '/' + row.validation + '/' + row.mode, deltas, expected: row.paired });
        }
      }
    }
    assert.equal(rowCount, 104);
  }
  // Quickselect gives an independent median implementation for the same declared xorshift sample stream.
  for (const item of intervals) {
    let state = 101, boot = [];
    for (let trial = 0; trial < 1999; trial++) {
      const values = [];
      for (let index = 0; index < 909; index++) {
        state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
        values.push(item.deltas[(state >>> 0) % 909]);
      }
      let left = 0, right = 908;
      while (left < right) {
        const pivot = values[(left + right) >>> 1]; let low = left, high = right;
        while (low <= high) {
          while (values[low] < pivot) low++;
          while (values[high] > pivot) high--;
          if (low <= high) { [values[low], values[high]] = [values[high], values[low]]; low++; high--; }
        }
        if (454 <= high) right = high; else if (454 >= low) left = low; else break;
      }
      boot.push(values[454]);
    }
    boot.sort((a, b) => a - b);
    assert(Math.abs(boot[9] - item.expected.low) < 1e-12, item.key + ' low99');
    assert(Math.abs(boot[1989] - item.expected.high) < 1e-12, item.key + ' high99');
  }
  for (const verdict of verdicts) for (const slope of verdict.slopes) {
    let sx = 0, sxx = 0, sy = 0, sxy = 0, ty = 0, txy = 0;
    for (const point of slope.points) { sx += point.branches; sxx += point.branches ** 2; sy += point.headMs; sxy += point.branches * point.headMs; ty += point.workingMs; txy += point.branches * point.workingMs; }
    const before = (4 * sxy - sx * sy) / (4 * sxx - sx * sx) * 1000;
    const after = (4 * txy - sx * ty) / (4 * sxx - sx * sx) * 1000;
    assert(Math.abs(before - slope.headUsPerBranch) < 1e-9); assert(Math.abs(after - slope.workingUsPerBranch) < 1e-9);
  }
  const react = JSON.parse(fs.readFileSync(path.join(directory, 'react-summary.json'), 'utf8'));
  assert.equal(react.digestPairs, 114); assert.equal(react.rows.length, 38); assert.equal(react.failedFixtures.length, 5);
  let reactWorkers = 0;
  for (const file of rawFiles.filter(file => /^react-(immediate|record)-.*-r[123]-(HEAD|0\.16\.0)\.json$/.test(file))) {
    const row = JSON.parse(fs.readFileSync(path.join(rawDirectory, file), 'utf8')); reactWorkers++;
    measuredWindows.push({ file, start: Date.parse(row.environment.startedAt), end: Date.parse(row.environment.endedAt), seconds: row.environment.seconds });
    if (row.version === 'HEAD') assert.equal(row.assertions.failedWrites, 0);
  }
  assert.equal(coreRecords, 621); assert.equal(reactWorkers, 228);
  const executionOrder = [];
  const readArtifact = name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
  for (const job of readArtifact('execution-react.json')) {
    const pair = JSON.parse(fs.readFileSync(path.join(rawDirectory, `pair-${job.lane}-${job.fixture}-r${job.run}.json`), 'utf8'));
    for (const version of pair.order) executionOrder.push(`react-${job.lane}-${job.fixture}-r${job.run}-${version}.json`);
  }
  executionOrder.push('AA/sample-0/off/1');
  for (const stage of ['AA', '1b', '2']) {
    for (const job of readArtifact(`execution-core-${stage}.json`).filter(job => job.exit === 0))
      executionOrder.push(`${stage}/${job.fixture}/${job.validation}/${job.run}`);
  }
  assert.equal(executionOrder.length, measuredWindows.length);
  const orderedWindows = executionOrder.map(file => {
    const matches = measuredWindows.filter(row => row.file === file);
    assert.equal(matches.length, 1, `execution identity ${file}`);
    return matches[0];
  });
  let clockOffsetMs = 0;
  const clockAdjustments = [];
  for (let index = 0; index < orderedWindows.length; index++) {
    const row = orderedWindows[index];
    row.adjustedStart = row.start + clockOffsetMs;
    const clockDifferenceMs = row.end - row.start - row.seconds * 1000;
    if (Math.abs(clockDifferenceMs) > 100) {
      assert.equal(row.file, '2/sample-2/off/3');
      clockAdjustments.push({ file: row.file, started: new Date(row.start).toISOString(),
        ended: new Date(row.end).toISOString(), monotonicSeconds: row.seconds, clockDifferenceMs });
      clockOffsetMs -= clockDifferenceMs;
    }
    row.adjustedEnd = row.end + clockOffsetMs;
    if (index) assert(row.adjustedStart >= orderedWindows[index - 1].adjustedEnd, `measurement worker overlap: ${row.file}`);
  }
  assert.equal(clockAdjustments.length, 1);
  measuredWindows.splice(0, measuredWindows.length, ...orderedWindows);
  assert(measuredWindows.every(row => row.seconds < 480));
  const manifest = fs.readFileSync(path.join(directory, 'raw-sha256.txt'), 'utf8').trimEnd().split('\n');
  assert.equal(manifest.length, rawFiles.length);
  for (let index = 0; index < rawFiles.length; index++) {
    const file = path.join(rawDirectory, rawFiles[index]);
    assert.equal(manifest[index], hash(fs.readFileSync(file)) + '  ' + file);
  }
  for (const bundle of bundles) assert.equal(hash(fs.readFileSync(bundle.file)), bundle.sha256);
  const reactBundle = JSON.parse(fs.readFileSync(path.join(rawDirectory, 'react-bundle.json'), 'utf8'));
  assert.equal(hash(fs.readFileSync(reactBundle.file)), reactBundle.sha256);
  const reportPath = path.join(directory, '..', 'profile-119-session.md');
  const report = fs.readFileSync(reportPath, 'utf8');
  assert(fs.statSync(reportPath).size <= 5_000_000);
  const completeTableCounts = {};
  const coreLine = /^\| [^ |]+\/(off|on)\/(mount|update|update-first|update-later|axis-update|axis-first|axis-later) \|/;
  const aaSection = report.slice(report.indexOf('## (3) Core A/A'), report.indexOf('## (4) 변경 1b'));
  completeTableCounts.AA = aaSection.split('\n').filter(line => coreLine.test(line)).length;
  assert.equal(completeTableCounts.AA, 104);
  for (const stage of ['1b', '2']) {
    const start = report.indexOf('다음 표는 ' + stage + '의 모든 104개 행');
    assert(start >= 0);
    const section = report.slice(start).split('\n## ')[0];
    completeTableCounts[stage] = section.split('\n').filter(line => coreLine.test(line)).length;
    assert.equal(completeTableCounts[stage], 104);
  }
  const reactSection = report.slice(report.indexOf('## (2) React'), report.indexOf('## (3) Core A/A'));
  completeTableCounts.React = reactSection.split('\n').filter(line => /^\| [^ |]+\/(mount|update) \|/.test(line)).length;
  assert.equal(completeTableCounts.React, 114);
  const artifacts = fs.readdirSync(directory).filter(file => fs.statSync(path.join(directory, file)).isFile()).map(file => ({ file, bytes: fs.statSync(path.join(directory, file)).size }));
  assert(artifacts.every(row => row.bytes <= 5_000_000));
  const sources = Object.fromEntries(artifacts.filter(row => /\.mjs$/.test(row.file)).map(row => [row.file, hash(fs.readFileSync(path.join(directory, row.file)))]));
  emitSummary('audit-results.json', { HEAD, time: new Date().toISOString(), passed: true, coreRecords, reactWorkers, rawFiles: rawFiles.length,
    medianChecks, independentIntervalChecks: intervals.length, axisSumChecks, slopesChecked: 6, overlapCount: 0,
    overlapMethod: 'Execution-log order and monotonic durations; timestamp boundaries adjusted only for documented wall-clock discontinuity',
    executionOrderChecks: executionOrder.length, clockAdjustments,
    manifestChecks: manifest.length, bundleHashChecks: bundles.length + 1, completeTableCounts,
    maxWorkerSeconds: Math.max(...measuredWindows.map(row => row.seconds)), start: new Date(measuredWindows[0].start).toISOString(),
    end: new Date(measuredWindows.at(-1).end).toISOString(), sourceHashes: sources, artifactLimitBytes: 5_000_000, endpointExcluded });
}
