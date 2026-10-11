// CLI derivation: executes the canonical reporter's calibration and validation code on fresh paired samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { endpointDifference95c01 } from '../tools/endpointDifference95c01.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(here);
const hash = text => createHash('sha256').update(text).digest('hex');
const manifestName = process.argv.find(value => value.startsWith('--manifest='))?.slice(11) ?? path.join(here, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestName, 'utf8'));
const records = manifest.records;
const injected = process.argv.includes('--injected');
const data = new Map(records.map(record => [record.timingFile, JSON.parse(fs.readFileSync(path.join(D, record.timingFile), 'utf8'))]));
const source = fs.readFileSync(path.join(D, 'tools/report-verdict-95c01.mjs'), 'utf8');
const metricSource = source.slice(source.indexOf('const metric ='), source.indexOf('const counts ='));
const calibrationSource = injected
  ? source.slice(source.indexOf('const controls ='), source.indexOf('const twoPassControls =')) +
    'calibration.callsAllPaths = controls.length;'
  : source.slice(source.indexOf('const controls ='), source.indexOf('const validationRows = []'));
const validationSource = source.slice(source.indexOf('const validationRows = []'), source.indexOf('const makeRow ='));
const calculate = new Function('assert', 'records', 'data', 'endpointDifference95c01',
  `${metricSource}\n${calibrationSource}\n${validationSource}\nreturn { calibration, validationRows, evaluated };`);
const result = calculate(assert, records, data, endpointDifference95c01);
const canonicalFixture = injected ? 'array-100' : 'array-500';
const canonicalKey = `${canonicalFixture}/off/update`;
const canonicalRow = result.validationRows.find(row => row.fixture === canonicalFixture && row.validation === 'off' && row.mode === 'update');
if (!injected) {
  assert.equal(records.length, 138);
  assert.equal(result.validationRows.length, 104);
  assert(canonicalRow.a.passed, 'Canonical array-500/off/update end-to-end check');
  assert.equal(result.evaluated.get(canonicalKey).new.source, 'sentinel');
} else {
  assert(!canonicalRow.a.withinNoise && !canonicalRow.a.allRunsWithinNoise, 'Injected 5ms engine work must fail numeric check A');
  assert(!canonicalRow.a.zeroEngineMacrotasks, 'Injected engine work must also fail the separate boundary check');
  assert(result.evaluated.get(canonicalKey).new.runs.every(run => run.differenceMs > 4.9));
}
for (let index = 0; index < records.length; index++) {
  const record = records[index];
  assert.equal(record.workerExit.code, 0); assert.equal(record.workerExit.signal, null); assert(record.workerExit.natural);
  assert.equal(record.warmup, 20); assert.equal(record.sampleCount, 101); assert(record.explicitGc);
  assert.equal(record.environment.head, manifest.head);
  assert.equal(record.timingColumns[2], 'pairedEmptyTailMs');
  assert.equal(record.toolSha256, records[0].toolSha256);
  assert.equal(record.sourceSha256, records[0].sourceSha256);
  assert(record.serviceExits.every(exit => exit.code === 0 && exit.signal === null));
  assert(record.transportElapsedMs < 480000);
  if (index) assert(Date.parse(record.environment.started) > Date.parse(records[index - 1].environment.ended));
  const peer = records.find(item => item.fixture === record.fixture && item.validation === record.validation && item.run === record.run && item.version !== record.version);
  assert.deepEqual(record.checks, peer.checks);
  assert(Object.values(data.get(record.timingFile)).every(rows => rows.length === 101));
}
const baseline = JSON.parse(fs.readFileSync(path.join(D, 'profile-111-final-summary.json'), 'utf8'));
const prior = JSON.parse(fs.readFileSync(path.join(D, 'profile-112-branch-summary.json'), 'utf8')).part1.recalculatedRows;
const rows = result.validationRows.map(row => {
  const before = prior.find(item => item.fixture === row.fixture && item.validation === row.validation && item.mode === row.mode);
  assert(before);
  const runs = result.evaluated.get(`${row.fixture}/${row.validation}/${row.mode}`).new.runs;
  return { key: `${row.fixture}/${row.validation}/${row.mode}`, fixture: row.fixture, validation: row.validation, mode: row.mode,
    callCount: row.callCount, checkA: row.a, differenceUs: row.a.differenceMs * 1000, noiseUs: row.a.noiseMs * 1000,
    correctedEndMedianUs: row.newPairedSentinel.median * 1000, correctedMicrotaskMedianUs: row.newMicrotask.median * 1000,
    runs: runs.map(run => ({ run: run.run, differenceUs: run.differenceMs * 1000, noiseUs: run.noiseMs * 1000,
      withinNoise: run.withinNoise, zeroEngineMacrotasks: run.zeroEngineMacrotasks })),
    beforeDifferenceUs: before.afterDifferenceUs, beforePass: before.afterPass,
    changedNumeric: Math.abs(row.a.differenceMs * 1000 - before.afterDifferenceUs) > 1e-9,
    changedPass: row.a.passed !== before.afterPass,
    original111DifferenceUs: before.beforeDifferenceUs, original111Pass: before.beforePass };
});
const officialMarkdown = fs.readFileSync(path.join(D, 'profile-111-final.md'), 'utf8');
const arrays = rows.filter(row => /^array-/.test(row.fixture));
const summary = { title: '112라운드 짝 sentinel 꼬리', head: manifest.head, generated: new Date().toISOString(),
  method: { pairedEmptyPosition: '각 실제 호출 직전, 같은 프로세스·checkpoint·sentinel 횟수, 엔진 작업 없음',
    pairedEmptyColumn: 'pairedEmptyTailMs = 짝 빈 종단 − 짝 빈 microtask',
    correctedEnd: '(종단 − kC) − [짝 빈 꼬리 − k(C−M)]', correctedMicrotask: 'microtask − kM',
    checkA: '표본별 보정 종단 − 보정 microtask 차이의 중앙값; pooled 및 세 회차 모두 기존 잡음 안',
    additionalBoundary: '새 엔진 예약·실행·microtask 경계 pending·sentinel pending·후속 예약/실행 0회',
    condition: '수치 검사와 경계 검사 모두 통과해야 행 통과',
    freshProcesses: records.length, order: ['old→new', 'new→old', 'old→new'], concurrency: 1,
    warmup: 20, samplesPerRun: 101, samplesPerVersion: 303, gc: '강제 GC·schema clone·check anchor는 clock 밖',
    officialDesign: '95C-01; OFF 1-pass/ON 2-pass; BF 실제 쓰기별 합 및 first/later·고정 분기 축 유지',
    noise: '기존 raw sentinel bootstrap 1000회·seed, 빈 대기 잔차 p95, C/M 중앙값 불확실성, 하한 1µs 유지',
    historicalReconstruction: '기존 원자료에는 독립된 짝 꼬리가 없어 104개 고유 행 전부 fresh 재측정',
    performanceVerdicts: '111 공식 성능 수치·배율·현재 판정·수용 표시는 갱신하지 않음',
    changedReference: '기각된 112 정정의 0µs 및 통과 여부; 최초 111 결과도 별도 보존' },
  calibration: result.calibration,
  validation: { uniqueRows: rows.length, displayRows: injected ? rows.length : 108, passed: rows.filter(row => row.checkA.passed).length,
    failedRows: rows.filter(row => !row.checkA.passed).map(row => row.key),
    arrays: { rows: arrays.length, passed: arrays.filter(row => row.checkA.passed).length },
    boundaryPassed: rows.filter(row => row.checkA.zeroEngineMacrotasks).length },
  arrays, rows, numericalChanges: rows.filter(row => row.changedNumeric).map(row => ({ key: row.key,
    beforeDifferenceUs: row.beforeDifferenceUs, afterDifferenceUs: row.differenceUs, noiseUs: row.noiseUs,
    beforePass: row.beforePass, afterPass: row.checkA.passed })),
  passChanges: rows.filter(row => row.changedPass).map(row => row.key),
  otherNumericalChanges: rows.filter(row => !/^array-/.test(row.fixture) && row.changedNumeric).map(row => ({ key: row.key,
    beforeDifferenceUs: row.beforeDifferenceUs, afterDifferenceUs: row.differenceUs, noiseUs: row.noiseUs,
    beforePass: row.beforePass, afterPass: row.checkA.passed })),
  otherPassChanges: rows.filter(row => !/^array-/.test(row.fixture) && row.changedPass).map(row => row.key),
  changesVsOriginal111: rows.filter(row => row.checkA.passed !== row.original111Pass).map(row => ({ key: row.key,
    beforePass: row.original111Pass, afterPass: row.checkA.passed })),
  preservedOfficialTable: { markdownSha256: hash(officialMarkdown), summarySha256: hash(JSON.stringify(baseline)),
    officialRows: baseline.officialRows.length, splitRows: baseline.updateSplitRows.length, axisRows: baseline.branchAxisRows.length },
  canonicalRowEndToEnd: { result: injected ? 'INJECTED_CHECK_A_FAILED' : 'CANONICAL_ROW_END_TO_END_OK', calibrationPassed: canonicalRow.a.passed,
    key: canonicalKey, checkA: canonicalRow.a, runs: arrays.find(row => row.key === canonicalKey)?.runs,
    officialSource: result.evaluated.get(canonicalKey).new.source, naturalWorkerAndEsbuildExits: true },
  audit: manifest.audit, sourceHashes: { worker: hash(fs.readFileSync(path.join(D, 'tools/measure-verdict-95c01.mjs'))),
    reporter: hash(source), analyzer: hash(fs.readFileSync(fileURLToPath(import.meta.url))) } };
console.log(JSON.stringify(summary));
