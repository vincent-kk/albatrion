/*
 * 사용법(stage-07 루트, ~/.nvm/versions/node/v26.11.1/bin/node):
 *   node <이 파일> [--rows=2000]
 * 129 도구의 자체 검사입니다. (1) 프로세스마다 수준이 다르지만 코드는 같은 A/A 행을 합성해 클러스터 bootstrap 99% 구간이 0을
 * 품는 비율을 내고, 같은 자료에 세션 119의 표본 단위 bootstrap(pairRows121)을 적용한 비율을 옆에 적습니다. (2) 참 이동을 넣은 행의
 * 검출률을 냅니다. (3) 확인 측정·124C-01 면제·계수 없음의 판정 규칙을 작은 합성 자료로 확인합니다. (4) 옛 기록 형식 두 가지를
 * 읽습니다. (5) measure-core-worker-129.mjs --self-test로 5 ms setImmediate 행의 (가) 실패를 확인합니다.
 * 결과는 stdout JSON 한 줄과 마지막 확인 줄입니다.
 */
// CLI self-test; synthetic data only, no bundle is loaded except by the spawned (ga) worker self-test.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { reportCluster129 } from './report-cluster-129.mjs';
import { pairRows121 } from './report-verdict-121.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const verification = path.resolve(directory, '..');
const rowCount = Number(process.argv.find(value => value.startsWith('--rows='))?.slice(7) ?? 2000);
assert(Number.isInteger(rowCount) && rowCount >= 100);
let state = 0x9e3779b9;
const uniform = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
const normal = () => Math.sqrt(-2 * Math.log(uniform() + 1e-12)) * Math.cos(2 * Math.PI * uniform());
/** Process-level model: a level per process, within-process noise, and rare positive spikes (a slow sample). */
const MODEL = { blocks: 24, samples: 41, processSd: 10, sampleSd: 3, spikeRate: .05, spikeSize: 30 };

/** One process's samples around its own level; `shift` is added to every sample (candidate slower when positive). */
const processSamples = shift => {
  const level = normal() * MODEL.processSd + shift;
  return Array.from({ length: MODEL.samples }, () => level + normal() * MODEL.sampleSd + (uniform() < MODEL.spikeRate ? MODEL.spikeSize * uniform() : 0));
};
/** A synthetic React-lane cluster-pair-129 record of one row; React needs no empty-call correction. */
const syntheticRecord = (stage, fixture, shift) => ({ format: 'cluster-pair-129', lane: 'react', stage, fixture, validation: 'off', confirm: null,
  verdictColumns: ['update-wall'], recordColumns: [],
  blocks: Array.from({ length: MODEL.blocks }, (_, block) => ({ block, order: block % 2 ? ['candidate', 'base'] : ['base', 'candidate'],
    base: { samples: { 'update-wall': processSamples(0) } }, candidate: { samples: { 'update-wall': processSamples(shift) } } })) });
/** The same blocks as session-119 pair workers, one worker per block, for the sample-level bootstrap contrast. */
const asWorkers = record => record.blocks.map(block => ({ summary: { stage: 'AA', fixture: record.fixture, validation: 'off', run: block.block + 1,
  postGcDiscardedPairs: 1, sameCompiledSource: false, verdictColumns: ['update'], recordColumns: [], sampleCount: MODEL.samples },
  timings: { base: { update: block.base.samples['update-wall'].map(value => [0, value, 0]) },
    candidate: { update: block.candidate.samples['update-wall'].map(value => [0, value, 0]) } } }));
const excludesZero = interval => interval.low > 0 || interval.high < 0;

// (1) A/A false-positive rate of the cluster bootstrap, with the sample-level bootstrap on a subset for contrast.
const aaRecords = Array.from({ length: rowCount }, (_, index) => ({ record: syntheticRecord('AA', `sim-${index}`, 0), source: `sim-${index}` }));
const aa = reportCluster129({ records: aaRecords });
const clusterRate = aa.aaSummary.verdictExcludingZeroRate;
const binomialHalfWidth = 2.576 * Math.sqrt(.01 * .99 / rowCount);
const contrastRows = aaRecords.slice(0, 100);
const sampleLevelRate = contrastRows.filter(({ record }) => excludesZero(pairRows121(asWorkers(record), verification)[0].newPaired)).length / contrastRows.length;
assert(clusterRate > .002 && clusterRate < .025, `Cluster A/A rate ${clusterRate} is far from 1%`);
assert(sampleLevelRate > .1, 'The sample-level bootstrap is expected to over-detect on clustered data');

// (2) Detection of a true shift (candidate slower), as the share of rows whose interval lies wholly below zero.
const detection = Object.fromEntries([10, 20].map(shift => {
  const report = reportCluster129({ records: Array.from({ length: 200 }, (_, index) => ({ record: syntheticRecord('AA', `shift-${shift}-${index}`, shift), source: `shift-${index}` })) });
  return [`shift${shift}`, report.rows.filter(row => row.statistic.high < 0).length / report.rows.length];
}));
assert(detection.shift20 > .9, `A two-process-SD shift must be detected: ${detection.shift20}`);

// (3) Rule logic on a small deterministic core scenario: confirmation, exemption conditions and the missing count.
const coreRecord = (stage, fixture, modes, values, confirm = null) => ({ format: 'cluster-pair-129', lane: 'core', stage, fixture, validation: 'off', confirm,
  verdictColumns: modes.filter(mode => !mode.endsWith('-nogc')), recordColumns: modes.filter(mode => mode.endsWith('-nogc')),
  callCounts: Object.fromEntries(modes.map(mode => [mode, 1])),
  blocks: Array.from({ length: MODEL.blocks }, (_, block) => ({ block, order: block % 2 ? ['candidate', 'base'] : ['base', 'candidate'],
    base: { emptyEndMs: [.01], samples: Object.fromEntries(modes.map(mode => [mode, Array.from({ length: 5 }, () => values[mode][0] + normal() * 1e-5)])) },
    candidate: { emptyEndMs: [.01], samples: Object.fromEntries(modes.map(mode => [mode, Array.from({ length: 5 }, () => values[mode][1] + normal() * 1e-5)])) } })) });
const rowsOf = stage => [
  coreRecord(stage, 'if-then', ['update-first', 'update-first-nogc', 'mount'],
    stage === 'AA' ? { 'update-first': [.4, .4], 'update-first-nogc': [.2, .2], mount: [.3, .3] }
      : { 'update-first': [.4, .403], 'update-first-nogc': [.2, .2], mount: [.3, .303] }),
  coreRecord(stage, 'oneOf-10', ['axis-update'], stage === 'AA' ? { 'axis-update': [2, 2] } : { 'axis-update': [2, 1.7] }),
].map((record, index) => ({ record, source: `${stage}-${index}` }));
const aaReport = reportCluster129({ records: rowsOf('AA') });
const confirmRecords = [coreRecord('head:x', 'if-then', ['update-first', 'mount'], { 'update-first': [.4, .403], mount: [.3, .3] },
  { source: 'synthetic', modes: ['update-first', 'mount'] })].map(record => ({ record, source: 'confirm' }));
const counts = { 'if-then/off/update-first': { calls: 3, probe: 'synthetic' } };
const pendingReport = reportCluster129({ records: rowsOf('head:x'), aa: aaReport, counts });
const withCounts = reportCluster129({ records: rowsOf('head:x'), aa: aaReport, counts, confirmRecords });
const withoutCounts = reportCluster129({ records: rowsOf('head:x'), aa: aaReport, confirmRecords });
assert.deepEqual(pendingReport.flaggedRegressions.map(row => row.key).sort(), ['if-then/off/mount', 'if-then/off/update-first']);
assert.equal(pendingReport.decision, 'CONFIRMATION_PENDING');
assert.deepEqual(withCounts.confirmation.rows.map(row => [row.key, row.status]).sort(), [['if-then/off/mount', '확인되지 않음'], ['if-then/off/update-first', '확인됨']]);
assert.equal(withCounts.exemption.rows.length, 1);
assert.equal(withCounts.exemption.rows[0].label, '측정 조건 소음(기록)');
assert.equal(withCounts.exemption.rows[0].workCount.changedCodeExecutes, true);
assert.equal(withCounts.decision, 'ADOPT');
assert.equal(withoutCounts.exemption.rows[0].workCount, '계수 없음');
assert.equal(withoutCounts.exemption.rows[0].exempted, false);
assert.equal(withoutCounts.decision, 'REJECT');
const noNoGc = reportCluster129({ records: rowsOf('head:x').map(({ record, source }) => ({ source, record: { ...record,
  recordColumns: [], blocks: record.blocks.map(block => ({ ...block, base: { ...block.base, samples: { ...block.base.samples, 'update-first-nogc': undefined } } })) } })),
  aa: aaReport, counts, confirmRecords });
assert(noNoGc.exemption.rows[0].reasons.includes('조건 (4) gc 없는 열 없음(먼저 잼)'));
assert.equal(noNoGc.decision, 'REJECT');

// (4) Legacy shapes: measure-core-pair-126 `{ workers }` and measure-verdict-121 --pair top-level summary/timings.
const legacyWorker = (run, shift) => ({ summary: { stage: 'AA', fixture: 'if-then', validation: 'off', run, block: 0, order: ['base', 'candidate'],
  interactionCount: 1, verdictColumns: ['mount'], recordColumns: [], sampleCount: 3 },
  timings: { base: { mount: [[0, 1, 0], [0, 1.1, 0], [0, .9, 0]] }, candidate: { mount: [[0, 1 + shift, 0], [0, 1.1, 0], [0, .9, 0]] } },
  empty: { before: [[0, .01, 0]], after: [[0, .01, 0]] } });
const legacy = reportCluster129({ records: [{ record: { workers: [legacyWorker(1, 0), legacyWorker(2, .01)] }, source: 'pair-legacy-126.json' },
  { record: legacyWorker(3, 0), source: 'pair-121-stdout.json' }] });
assert.equal(legacy.rows.find(row => row.key === 'if-then/off/mount').blocks, 3);

// (5) (ga) worker self-test: the injected five-millisecond global setImmediate row must fail.
const ga = spawnSync(process.execPath, ['--expose-gc', path.join(directory, 'measure-core-worker-129.mjs'), '--self-test'], { encoding: 'utf8', timeout: 120000 });
assert.equal(ga.status, 0, ga.stderr);
assert(ga.stdout.includes('SELF_TEST_129_OK'));
const gaRows = JSON.parse(ga.stdout.split('\n')[0]).selfTest.map(row => ({ row: row.row, passed: row.passed, differenceMs: row.differenceMs,
  noiseMs: row.noiseMs, globalImmediate: row.boundary.globalImmediate, microtasksQueued: row.boundary.microtasksQueued }));

console.log(JSON.stringify({ model: MODEL, aa: { rows: rowCount, clusterExcludingZero: aa.aaSummary.verdictExcludingZero.length, clusterRate,
  expectedRate: .01, binomial99HalfWidth: binomialHalfWidth, sampleLevelContrastRows: contrastRows.length, sampleLevelRate },
  detection, rules: { pending: pendingReport.decision, withCounts: withCounts.decision, withoutCounts: withoutCounts.decision, withoutNoGcColumn: noNoGc.decision },
  legacyBlocks: legacy.rows[0].blocks, ga: gaRows }));
console.log(`SELF_TEST_129_ALL_OK: cluster A/A ${(clusterRate * 100).toFixed(2)}% of ${rowCount} rows exclude 0 (sample-level ${(sampleLevelRate * 100).toFixed(0)}%); ` +
  `shift 10/20 detected ${(detection.shift10 * 100).toFixed(0)}%/${(detection.shift20 * 100).toFixed(0)}%; rules and (ga) as expected`);
