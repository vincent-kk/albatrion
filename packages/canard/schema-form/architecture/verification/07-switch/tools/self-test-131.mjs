// CLI contract checks for run-session-131; synthetic values never support timing judgments.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { PerformanceObserver } from 'node:perf_hooks';
import { parseSession131 } from './parse-session-131.mjs';
import { verifyBundles131 } from './verify-bundles-131.mjs';
import { scopeRows131 } from './scope-rows-131.mjs';
import { confirmationRows131 } from './confirmation-rows-131.mjs';
import { summarizeSession131 } from './summarize-session-131.mjs';
import { sessionRows131 } from './session-rows-131.mjs';
import { loadBundle131 } from './load-bundle-131.mjs';
import { gcObservation131 } from './gc-observation-131.mjs';
import { reportCluster129 } from './report-cluster-129.mjs';
import { watchScope131 } from './watch-scope-131.mjs';
import { telemetry131 } from './telemetry-131.mjs';
import { annotateRow131 } from './annotate-row-131.mjs';
import { preflightSession131, assertBudget131 } from './preflight-session-131.mjs';
import { medianInterval131 } from './median-interval-131.mjs';
import { reportSession131 } from './report-session-131.mjs';
import { useMeasuredBlocks131 } from './use-measured-blocks-131.mjs';
import { binomialBand131, aaCounts131 } from './aa-band-131.mjs';
import { swapReport131 } from './swap-report-131.mjs';
import { selectMeasuredRows131 } from './select-measured-rows-131.mjs';
import { measurementNode131, measurementNodeVersion131 } from './measurement-node-131.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'self-test-131-'));
const sha = value => createHash('sha256').update(value).digest('hex');
let checks = 0;
try {
  const kTable = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7,
    8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15, 15];
  for (let n = 8; n <= 48; n++) {
    const values = Array.from({ length: n }, (_, i) => n - i), result = medianInterval131(values);
    assert.equal(result.k, kTable[n - 8], `Exact rank at n=${n}`);
    assert(result.coverage >= .99);
    assert.equal(result.low, result.k);
    assert.equal(result.high, n - result.k + 1);
    assert.equal(result.median, (n + 1) / 2);
    assert.equal(values[0], n, 'Input is not mutated');
  }
  assert.throws(() => medianInterval131([]), /finite/);
  assert.throws(() => medianInterval131([NaN]), /finite/);
  assert.equal(medianInterval131([1, 2]).unbounded, true);
  let randomState = 131132;
  const random = () => { randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5;
    return (randomState >>> 0) / 4294967296; };
  const simulated = [];
  for (const blocks of [8, 24]) {
    const trials = 1000000; let excluded = 0;
    for (let trial = 0; trial < trials; trial++) {
      const interval = medianInterval131(Array.from({ length: blocks }, () => random() - .5));
      if (interval.low > 0 || interval.high < 0) excluded++;
    }
    const expected = 1 - medianInterval131(Array.from({ length: blocks }, (_, i) => i)).coverage;
    const rate = excluded / trials;
    assert(Math.abs(rate - expected) < 6 * Math.sqrt(expected * (1 - expected) / trials), 'Simulated rate agrees with exact coverage');
    simulated.push({ blocks, trials, excluded, rate, expected });
  }
  console.log(`MEDIAN_INTERVAL_131_OK: exact k at n=8..48; coverage >= 0.99; simulated A/A ${simulated.map(item => `${item.blocks} blocks ${(100 * item.rate).toFixed(3)}% (${item.excluded}/${item.trials})`).join('; ')}`);
  checks++;
  const observe = PerformanceObserver.prototype.observe, disconnect = PerformanceObserver.prototype.disconnect;
  let starts = 0, stops = 0;
  PerformanceObserver.prototype.observe = function(...args) { starts++; return observe.apply(this, args); };
  PerformanceObserver.prototype.disconnect = function(...args) { stops++; return disconnect.apply(this, args); };
  try {
    const telemetry = telemetry131(true);
    assert.equal(typeof telemetry.start, 'function', 'GC observation starts only in the no-GC pass');
    assert.equal(typeof telemetry.stop, 'function');
    assert.equal(starts, 0, 'Worker preparation and forced-GC pass have no GC observer');
    telemetry.window('update', [[0, 1]], 0);
    telemetry.start();
    assert.equal(starts, 1);
    telemetry.window('update-nogc', [[0, 1]], 0);
    await telemetry.stop();
    assert.equal(stops, 1);
    telemetry.window('update', [[0, 1]], 1);
    const finished = await telemetry.finish();
    assert.equal(starts, 1);
    assert.equal(stops, 1);
    assert.equal(finished.gc.update, undefined);
    assert.equal(finished.gc['update-nogc'].length, 1);
    assert.equal(gcObservation131({ blocks: [] }, 'update'), null);
  } finally {
    PerformanceObserver.prototype.observe = observe;
    PerformanceObserver.prototype.disconnect = disconnect;
  }
  checks++;
  const args = ['--kind', 'aa', '--lane=core', '--base', 'a', '--candidate=b', '--rows', 'core-129', '--blocks=24', '--out', root, '--node-version', measurementNodeVersion131];
  const options = parseSession131(args);
  assert.equal(options.formsPerProcess, 1);
  assert.equal(options.reducedBlocks, 8);
  assert.equal(options.warmup, 20);
  assert.equal(options.samples, 41);
  assert.throws(() => parseSession131([...args, '--unknown=1']), /Unknown/);
  assert.throws(() => parseSession131(args.slice(0, -2)), /Required: --node-version/);
  assert.throws(() => parseSession131([...args.slice(0, -2), '--node-version', '26.11']), /must look like/);
  assert.equal(parseSession131(args).nodeVersion, measurementNodeVersion131);
  assert.throws(() => parseSession131(args.map(value => value === '--blocks=24' ? '--blocks=0' : value)), /Invalid --blocks/);
  assert.throws(() => parseSession131(args.map(value => value === '--lane=core' ? '--lane=other' : value)), /--lane/);
  assert.throws(() => parseSession131([...args, '--forms-per-process=-1']), /Invalid --forms/);
  assert.throws(() => parseSession131(args.map(value => value === 'aa' ? 'verdict' : value)), /require --aa/);
  assert.equal(parseSession131([...args, '--forms-per-process', '2']).formsPerProcess, 2);
  assert.equal(parseSession131([...args, '--swap']).swap, true);
  assert.throws(() => parseSession131([...args, '--swap=false']), /--swap takes/);
  assert.throws(() => parseSession131([...args.map(value => value === 'aa' ? 'verdict' : value), '--aa=x', '--swap']), /only for kind aa/);
  const fullRows = scopeRows131(sessionRows131('core-129', 'core'), undefined, 24, 8);
  assertBudget131(preflightSession131(options, fullRows));
  const normalPlan = preflightSession131(options, fullRows), swapPlan = preflightSession131({ ...options, swap: true }, fullRows);
  assert.equal(swapPlan.estimate.totalMs, 2 * normalPlan.estimate.totalMs);
  assert.equal(swapPlan.passes, 2);
  assert.throws(() => assertBudget131(preflightSession131(options, fullRows, 1)), /Before measurement/);
  for (const preset of ['react-129-main', 'react-129-large', 'react-129-array-1000', 'react-129-nested-d5']) {
    const requested = watchScope131(sessionRows131(preset, 'react'), 'react');
    const zeroCounts = Object.fromEntries(requested.map(row => [row.key, 0]));
    const scopedRows = scopeRows131(requested, zeroCounts, 24, 8);
    const planned = preflightSession131({ ...options, lane: 'react' }, scopedRows);
    assert.equal(planned.confirmReserveMs, Math.max(1200000, planned.estimate.totalMs * .25));
    if (preset === 'react-129-large') assert.throws(() => assertBudget131(planned), /split --rows/);
    else assertBudget131(planned);
  }
  checks++;

  const revision = '1'.repeat(40), base = 'module.exports = {};\n', copy = base + '// A/A copy\n';
  fs.writeFileSync(path.join(root, 'x-head.cjs'), base);
  fs.writeFileSync(path.join(root, 'x-headx.cjs'), copy);
  const manifest = { baseRevision: revision, bundles: ['head', 'headx'].map((name, index) => ({
    file: path.join(root, `x-${name}.cjs`), revision, sha256: sha(index ? copy : base), bytes: Buffer.byteLength(index ? copy : base),
  })) };
  const manifestFile = path.join(root, 'x-manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  const bundleOptions = { kind: 'aa', base: path.join(root, 'x-head'), candidate: path.join(root, 'x-headx.cjs') };
  assert.equal(verifyBundles131(bundleOptions).base.revision, revision);
  fs.writeFileSync(path.join(root, 'x-headx.cjs'), copy + 'tampered');
  assert.throws(() => verifyBundles131(bundleOptions), /SHA-256/);
  fs.writeFileSync(path.join(root, 'x-headx.cjs'), copy);
  manifest.bundles[1].revision = '2'.repeat(40);
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  assert.throws(() => verifyBundles131(bundleOptions), /revision/i);
  manifest.bundles[1].revision = revision;
  manifest.baseRevision = '2'.repeat(40);
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  assert.throws(() => verifyBundles131(bundleOptions), /revision/i);
  manifest.baseRevision = revision;
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  const verified = verifyBundles131(bundleOptions);
  const guardedOut = path.join(root, 'budget-refusal');
  const refusal = spawnSync(measurementNode131, [new URL('./run-session-131.mjs', import.meta.url).pathname,
    '--kind=aa', '--lane=core', `--base=${bundleOptions.base}`, `--candidate=${bundleOptions.candidate}`,
    '--rows=core-129', '--blocks=2', '--warmup=1', '--samples=1', '--budget-seconds=1', `--out=${guardedOut}`, '--smoke', `--node-version=${process.version}`],
    { encoding: 'utf8' });
  assert.equal(refusal.status, 1);
  assert.match(refusal.stdout, /Before measurement/);
  assert.match(refusal.stdout, /SESSION_131_ESTIMATE/);
  const refused = JSON.parse(fs.readFileSync(path.join(guardedOut, 'final.json')));
  assert.equal(refused.preflight.fits, false);
  assert.equal(refused.processes.length, 0);
  assert(!fs.existsSync(path.join(guardedOut, 'raw')), 'Budget refusal must precede worker output');
  const loaded = loadBundle131(verified.base, () => { throw new Error('Synthetic bundle needs no require'); });
  assert.equal(loaded.bundlesLoaded, 1);
  assert.equal(loaded.api, loadBundle131(verified.base, () => {}).api);
  assert.equal(loadBundle131(verified.base, () => {}).bundlesLoaded, 1);
  assert.throws(() => loadBundle131(verified.candidate, () => {}), /Never mix/);
  checks++;

  for (const lane of ['core', 'react']) {
    const canonical = fs.readFileSync(new URL(`../profile-129a-session/${lane}-rows.csv`, import.meta.url), 'utf8')
      .trim().split('\n').slice(1).map(line => line.split(',')[0]).sort();
    assert.deepEqual(sessionRows131(`${lane}-129`, lane).map(row => row.key).sort(), canonical);
  }
  assert(watchScope131(sessionRows131('react-129-large', 'react'), 'react').some(row => row.key === 'array-500/off/mount-wall-nogc'));
  assert(watchScope131(sessionRows131('smoke', 'core'), 'core').some(row => row.key === 'oneOf-40/off/axis-first'));
  checks++;

  const rows = ['flat-50/off/mount', 'flat-50/off/update', 'oneOf-5/off/axis-first', 'if-then/on/update',
    'computed-visible-derived/off/update-first', 'sample-1/off/update-later-nogc'].map(key => ({ key }));
  const counts = Object.fromEntries(rows.map(row => [row.key, 0]));
  counts['flat-50/off/update'] = { calls: 3 };
  const scoped = scopeRows131(rows, counts, 24, 8);
  assert.deepEqual(scoped.map(row => row.blocks), [8, 24, 24, 24, 24, 24]);
  assert.equal(scoped[0].scope, 'reduced');
  assert.equal(scopeRows131(rows, undefined, 24, 8)[0].blocks, 24);
  assert.equal(scopeRows131([{ key: 'flat-100/off/mount' }], {}, 24, 8)[0].blocks, 24);
  assert.equal(scopeRows131([{ key: 'flat-50/off/update' }, { key: 'flat-50/off/update-nogc' }],
    { 'flat-50/off/update': 1, 'flat-50/off/update-nogc': 0 }, 24, 8)[1].blocks, 24);
  assert.equal(scopeRows131([{ key: 'flat-50/off/update-nogc' }],
    { 'flat-50/off/update': 1, 'flat-50/off/update-nogc': 0 }, 24, 8)[0].blocks, 24);
  checks++;

  const sampleSide = { samples: { 'update-nogc': [1, 2, 9] }, gc: { 'update-nogc': [0, 0, 1].map(count => ({
    windows: 2, windowsWithGc: count, writeWindows: 2, writeWindowsWithGc: count,
  })) } };
  const observation = gcObservation131({ blocks: [{ base: sampleSide, candidate: sampleSide }] }, 'update-nogc');
  assert.equal(observation.base.gcFreeMedian, 1.5);
  assert.equal(observation.base.writeWindowGcFraction, 1 / 6);
  checks++;

  const record = { format: 'cluster-pair-129', lane: 'core', stage: 'AA', fixture: 'flat-50', validation: 'off', confirm: null,
    verdictColumns: ['mount'], recordColumns: [], blocks: [0, 1].map(block => ({ block, order: ['base', 'candidate'],
      base: { samples: { mount: [10] }, emptyEndMs: [1] }, candidate: { samples: { mount: [10] }, emptyEndMs: [1] } })) };
  const baseline = reportCluster129({ records: [{ record, source: 'whole' }] });
  const partitioned = reportCluster129({ records: [{ record, source: 'owner' },
    { record: { ...record, verdictColumns: [], recordColumns: ['mount-nogc'], coreEmptyPool131: false,
      blocks: record.blocks.map(block => ({ ...block, base: { ...block.base, samples: { 'mount-nogc': [10] }, emptyEndMs: [1000] },
        candidate: { ...block.candidate, samples: { 'mount-nogc': [10] }, emptyEndMs: [1000] } })) }, source: 'no-duplicate-empty' }] });
  assert.equal(partitioned.rows.find(row => row.mode === 'mount').correctionMs, baseline.rows[0].correctionMs);
  checks++;

  const long = { ...record, interactionCount: 1, verdictColumns: ['update', 'update-first'], recordColumns: ['update-nogc', 'update-first-nogc'],
    scope131: { scope: 'full', blocks: 24 }, blocks: Array.from({ length: 24 }, (_, block) => ({ block, order: ['base', 'candidate'],
      ...Object.fromEntries(['base', 'candidate'].map(role => [role, { emptyEndMs: [1], samples: Object.fromEntries(
        ['update', 'update-first', 'update-nogc', 'update-first-nogc'].map(mode => [mode, [role === 'base' ? 10 : 9]])) }])) })) };
  const selectedShort = { ...long, verdictColumns: ['update-first'], recordColumns: [], scope131: { scope: 'reduced', blocks: 8 }, blocks: long.blocks.slice(0, 8), coreEmptyPool131: false };
  const plannedRows = [{ key: 'flat-50/off/update', mode: 'update', scope: 'full', blocks: 24 },
    { key: 'flat-50/off/update-first', mode: 'update-first', scope: 'reduced', blocks: 8 }];
  const selectedMeasured = selectMeasuredRows131(long, plannedRows);
  assert.equal(selectedMeasured[1].blocks.length, 24, 'Actual runner partition keeps every measured block');
  assert.equal(selectedMeasured.filter(item => item.coreEmptyPool131).length, 1);
  const selectedConfirm = selectMeasuredRows131({ ...long, confirm: { modes: ['update', 'update-first'] } }, plannedRows);
  assert.equal(selectedConfirm[1].blocks.length, 24);
  assert.deepEqual(selectedConfirm[1].confirm.modes, ['update-first']);
  const restored = useMeasuredBlocks131([{ source: 'all', record: long }, { source: 'short', record: selectedShort }]);
  assert.equal(restored[1].record.blocks.length, 24);
  const unique = reportSession131({ records: restored });
  assert.equal(unique.rows.length, 2);
  assert.equal(unique.aaSummary.verdictRows, 1);
  assert.equal(unique.mergedRows.length, 2);
  assert(unique.rows.every(row => row.blocks === 24 && row.scope === 'full' && row.statistic.k === 6));
  const onlyFirst = reportSession131({ records: [{ source: 'first-only', record: selectedShort }] });
  assert.equal(onlyFirst.rows[0].key, 'flat-50/off/update');
  assert.equal(onlyFirst.rows[0].scope, 'reduced');
  const correlated = reportSession131({ records: [{ source: 'two-interactions', record: { ...long, interactionCount: 2 } }] });
  assert.equal(correlated.rows.length, 4);
  assert(correlated.method.rowDependence.includes('명목'));
  const difference = structuredClone(long); difference.blocks[0].base.samples['update-first'] = [999];
  assert.throws(() => reportSession131({ records: [{ record: difference, source: 'mismatch' }] }), /cannot merge/);
  assert.match(baseline.method.interval, /bootstrap/);
  assert.equal(baseline.rows[0].statistic.trials, 1999);
  checks++;

  assert.deepEqual([binomialBand131(97).low, binomialBand131(97).high], [0, 4]);
  assert.deepEqual([binomialBand131(21).low, binomialBand131(21).high], [0, 2]);
  const artificial = Array.from({ length: 100 }, (_, i) => ({ key: String(i), column: 'verdict', scope: i < 21 ? 'full' : 'reduced',
    excludesZero: i < 3, statistic: { unbounded: false } }));
  const bands = aaCounts131(artificial, 24);
  assert.equal(bands.total.inside, true);
  assert.equal(bands.full.inside, false);
  assert.equal(bands.passed, false, 'Total inside cannot hide full-row failure');
  checks++;

  const flipped = structuredClone(long);
  for (const block of flipped.blocks) [block.base, block.candidate] = [block.candidate, block.base];
  const swapped = swapReport131(unique, reportSession131({ records: [{ record: flipped, source: 'swapped' }] }));
  assert(swapped.rows.every(row => row.swapComparison === 'sign-flipped'));
  assert(swapReport131(unique, unique).rows.every(row => row.swapComparison === 'same-sign'));
  const swappedSummary = summarizeSession131({ kind: 'aa', lane: 'core', smoke: true, status: 'passed', report: swapped,
    scoping: [], processes: [], time: {}, estimate: { fixtures: [], complete: false } });
  assert(swappedSummary.includes('교환 중앙값'));
  assert(swappedSummary.includes('0을 제외') || swappedSummary.includes('0 제외/판정 행'));
  assert(swappedSummary.includes('update-first<br>') || swappedSummary.includes('update<br>flat-50/off/update-first'));
  checks++;

  const first = { format: 'cluster-report-129', stage: 'session131', flaggedRegressions: [
    { key: 'flat-50/off/mount', lane: 'core', fixture: 'flat-50', validation: 'off', mode: 'mount' },
    { key: 'flat-50/off/update-wall', lane: 'react', fixture: 'flat-50', validation: 'off', mode: 'update-wall' },
  ], gains: ['flat-50/off/update'] };
  assert.deepEqual(confirmationRows131(first, 'core', 24).map(row => [row.key, row.blocks]), [['flat-50/off/mount', 24]]);
  assert.deepEqual(confirmationRows131({ ...first, flaggedRegressions: [] }, 'core', 24), []);
  assert.throws(() => confirmationRows131({ ...first, stage: 'AA' }, 'core', 24));
  checks++;

  const change = { ...record, stage: 'session131', blocks: Array.from({ length: 8 }, (_, block) => ({ ...record.blocks[block % 2], block,
    candidate: { samples: { mount: [10.2] }, emptyEndMs: [1] } })) };
  const initial = reportCluster129({ records: [{ record: change, source: 'reduced-eight' }], aa: baseline });
  assert.equal(initial.flaggedRegressions.length, 1, 'Eight-block rows retain the 105C-01 rule');
  const plan = confirmationRows131(initial, 'core', 24);
  assert.equal(plan[0].blocks, 24);
  const confirmed = { ...change, confirm: { modes: ['mount'] }, blocks: Array.from({ length: 24 }, (_, block) => ({ ...change.blocks[block % 8], block })) };
  const second = reportCluster129({ records: [{ record: change, source: 'reduced-eight' }], aa: baseline,
    confirmRecords: [{ record: confirmed, source: 'independent-twenty-four' }] });
  assert.equal(second.confirmation.rows[0].confirmed, true);
  assert.equal(second.confirmation.rows[0].second.blocks, 24);
  assert.equal(second.decision, 'REJECT');
  const intervalAA = reportSession131({ records: [{ record: { ...record, blocks: Array.from({ length: 24 }, (_, block) => ({ ...record.blocks[block % 2], block })) }, source: 'new-aa' }] });
  const newFirst = reportSession131({ records: [{ record: change, source: 'new-first' }], aa: intervalAA });
  const newSecond = reportSession131({ records: [{ record: change, source: 'new-first' }], aa: intervalAA,
    confirmRecords: [{ record: confirmed, source: 'new-confirm' }] });
  assert.equal(newFirst.rows[0].statistic.k, 1);
  assert.equal(newSecond.confirmation.rows[0].second.statistic.k, 6);
  assert.equal(newSecond.rows[0].verdict.aaMagnitudeMs, Math.abs(intervalAA.rows[0].statistic.median));
  assert.throws(() => reportSession131({ records: [{ record: change, source: 'old-aa' }], aa: baseline }), /Recompute A\/A/);
  const annotated = annotateRow131(second.rows[0], { scope: 'reduced', reason: 'zero-count' }, second.confirmation.rows[0]);
  assert.equal(annotated.confirmBlocks, 24);
  assert.equal(annotated.confirmStatus, '확인됨');
  assert.equal(annotated.observation131, '확인됨');
  const quiet = annotateRow131({ key: 'quiet', column: 'verdict', blocks: 8, statistic: { median: 0 } }, { scope: 'reduced' });
  assert.equal(quiet.observation131, '줄인 검출력에서 관측되지 않음');
  assert.equal(quiet.confirmBlocks, null);
  assert.equal(quiet.confirmStatus, null);
  const recorded = annotateRow131({ ...quiet, column: 'record' }, { scope: 'reduced' });
  assert.equal(recorded.observation131, '기록');
  checks++;

  const summary = summarizeSession131({ kind: 'aa', lane: 'core', smoke: true, status: 'passed',
    report: { rows: [quiet, recorded, annotated], decision: null }, scoping: scoped, time: { totalMs: 1000, confirmMs: 0, reportMs: 2 },
    processes: [{ time: { startToReadyMs: 1, warmupMs: 2, forcedGcMs: 3, sampleMs: 4, digestMs: 5 } }],
    estimate: { totalMs: 3000, fixtures: [{ fixture: 'flat-50', totalMs: 3000 }] } });
  for (const field of ['전체', '확인', '보고', '준비', '예열', '강제 GC', '표본', 'digest', '축소', '판정', '추정'])
    assert(summary.includes(field), field);
  assert(summary.includes('확인 블록'));
  assert(summary.includes('| quiet | reduced | 8 | null | 줄인 검출력에서 관측되지 않음 |'));
  assert(summary.includes('| reduced | 8 | 24 | 확인됨 |'));
  assert(summary.includes('최종 판정 필드는 SMOKE_NO_VERDICT입니다. 축소 비표시 행은 줄인 검출력에서 관측되지 않음'));
  checks++;
  console.log(`SELF_TEST_131_OK: ${checks} contract groups passed; no timing judgments`);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
