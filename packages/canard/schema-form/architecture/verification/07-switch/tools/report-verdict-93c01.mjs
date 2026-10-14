// Loaded after all measurements; emits bounded patch chunks for the native file editor.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(directory, '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
const fixtures = ['sample-0', 'sample-1', 'sample-2', 'sample-3',
  'flat-50', 'flat-100', 'flat-500', 'nested-d3-f4', 'nested-d5-f4',
  'array-100', 'array-500', 'array-1000', 'computed-visible-derived',
  'oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40', 'if-then'];
const phaseNames = ['analysis', 'creation', 'settlement', 'validation-registration',
  'validation-run', 'delivery', 'react-render', 'react-commit', 'other'];
const phaseLabels = { analysis: '분석', creation: '생성', settlement: '정착',
  'validation-registration': '검증 등록', 'validation-run': '검증 실행', delivery: '배달',
  'react-render': '렌더', 'react-commit': '커밋', other: '기타' };
const branch = fixture => /oneOf|if-then/.test(fixture);
const modeLabel = mode => ({ mount: '마운트', update: 'BF 갱신 열',
  'update-first': '마운트 직후 첫 갱신', 'update-later': '이후 갱신' })[mode];
const metric = values => {
  const sorted = values.toSorted((a, b) => a - b);
  assert(sorted.length && sorted.every(Number.isFinite));
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length };
};
const expand = frequency => Object.entries(frequency).flatMap(([value, count]) => Array(count).fill(Number(value)));
const fmt = value => Number.isFinite(value) ? value.toFixed(4) : '보정 불가';
const mp = value => `${fmt(value.median)} / ${fmt(value.p99)}`;
const hash = value => createHash('sha256').update(value).digest('hex');
const cache = new Map();
const manifest = [];
let timingSamplesChecked = 0, maxActiveError = 0;

/** Validate every input artifact before deriving a verdict from its timing-only samples. */
function load(lane, fixture, validation, run, version) {
  const stem = `verdict-93c01-${lane}-${fixture}-${validation}-r${run}-${version}`;
  if (cache.has(stem)) return cache.get(stem);
  const summaryText = fs.readFileSync(path.join(output, `${stem}-summary.json`), 'utf8');
  const timingText = fs.readFileSync(path.join(output, `${stem}-timings.json`), 'utf8');
  assert(Buffer.byteLength(summaryText) <= 5_000_000 && Buffer.byteLength(timingText) <= 5_000_000);
  const summary = JSON.parse(summaryText), timings = JSON.parse(timingText);
  const env = summary.environment;
  for (const [key, value] of Object.entries({ lane, fixture, validation, run, version })) assert.equal(env[key], value);
  assert.equal(env.node, process.version);
  assert.equal(env.v8, process.versions.v8);
  assert.equal(env.head, 'ccfecf1b43ce1c648246722e2174db81ec17487f');
  assert(env.warmup >= 10 && env.samples >= 100 && env.explicitGc);
  assert.equal(env.extraPhaseSpans, lane !== 'react');
  assert.equal(env.productionProfiling, lane.startsWith('react'));
  for (const mode of ['mount', 'update', 'update-first', 'update-later']) {
    assert.equal(timings[mode].length, 101);
    assert.equal(timings[`${mode}-empty-span`].length, 101);
    for (const sample of timings[mode]) {
      assert(Object.values(sample).filter(value => typeof value === 'number').every(Number.isFinite));
      assert(Object.values(sample.phases).every(value => typeof value === 'number' && Number.isFinite(value)));
      assert.deepEqual(Object.keys(sample).sort(), ['elapsed', 'active', 'synchronous', 'profiler', 'phases',
        'ajv', 'renderCommit', 'correctedActive', 'correctedRenderCommit'].sort());
      const active = phaseNames.reduce((sum, phase) => sum + sample.phases[phase], 0);
      maxActiveError = Math.max(maxActiveError, Math.abs(active - sample.active));
      assert(Math.abs(active - sample.active) < 1e-7);
      if (lane === 'react') assert(sample.profiler > 0);
      timingSamplesChecked++;
    }
  }
  const result = { summary, timings };
  cache.set(stem, result);
  manifest.push({ stem, summaryBytes: Buffer.byteLength(summaryText), timingsBytes: Buffer.byteLength(timingText),
    summarySha256: hash(summaryText), timingsSha256: hash(timingText), started: env.started, ended: env.ended });
  return result;
}

/** Pool only the three alternating runs of a fixed fixture/version/session. */
function side(lane, fixture, validation, mode, version) {
  const datasets = [1, 2, 3].map(run => load(lane, fixture, validation, run, version));
  const samples = datasets.flatMap(data => data.timings[mode]);
  const rows = datasets.map(data => data.summary.rows.find(row => row.mode === mode));
  const calls = rows.flatMap(row => expand(row.callFrequency));
  const commits = rows.flatMap(row => expand(row.commitFrequency));
  assert.equal(samples.length, 303);
  assert.equal(calls.length, 303);
  assert.equal(commits.length, 303);
  const key = lane === 'react' ? 'profiler' : 'active';
  const correctedKey = lane === 'react' ? 'profiler' : 'correctedActive';
  return { metric: metric(samples.map(sample => sample[key])), corrected: metric(samples.map(sample => sample[correctedKey])),
    active: metric(samples.map(sample => sample.active)), profiler: metric(samples.map(sample => sample.profiler)),
    renderCommit: metric(samples.map(sample => sample.renderCommit)),
    correctedRenderCommit: metric(samples.map(sample => sample.correctedRenderCommit)),
    ajv: metric(samples.map(sample => sample.ajv)),
    instrumentation: { calls: metric(calls), callsTotal: calls.reduce((a, b) => a + b, 0),
      perCallMs: metric(datasets.flatMap(data => data.timings[`${mode}-empty-span`])),
      perRunCostMs: rows.map(row => row.calibration.perCallMs.median),
      correctionModel: rows[0].calibration.model },
    commits: metric(commits),
    phases: Object.fromEntries(phaseNames.map(phase => [phase, {
      time: metric(samples.map(sample => sample.phases[phase] ?? 0)),
      calls: metric(rows.flatMap(row => expand(row.phases[phase].callFrequency))),
    }])),
    runs: datasets.map((data, index) => ({ run: index + 1,
      metric: metric(data.timings[mode].map(sample => sample[key])),
      corrected: metric(data.timings[mode].map(sample => sample[correctedKey])),
      source: manifest.find(file => file.stem === `verdict-93c01-${lane}-${fixture}-${validation}-r${index + 1}-${version}`).stem,
    })),
  };
}

/** Keep raw official ratios authoritative and expose a model correction without replacing the method. */
function pair(lane, fixture, validation, mode) {
  const old = side(lane, fixture, validation, mode, 'old'), next = side(lane, fixture, validation, mode, 'new');
  for (const run of [1, 2, 3]) {
    const a = load(lane, fixture, validation, run, 'old').summary;
    const b = load(lane, fixture, validation, run, 'new').summary;
    assert.deepEqual(a.checks[mode], b.checks[mode], `${lane}/${fixture}/${validation}/${mode}`);
    assert.equal(a.environment.originalDiagnosticSha256, b.environment.originalDiagnosticSha256);
  }
  const officialLane = lane === 'core' || lane === 'react';
  const target = !officialLane || branch(fixture) ? null : lane === 'core' ? 1.5 : mode === 'mount' ? 1.2 : 1.0;
  const ratio = next.metric.median / old.metric.median;
  const correctedRatio = old.corrected.median > 0 && next.corrected.median >= 0 ? next.corrected.median / old.corrected.median : null;
  const verdict = target === null ? !officialLane ? '단계 진단 전용' : validation === 'on'
    ? '검증 ON 기록 전용' : '91라운드 기준별 판단' : ratio <= target ? '충족' : '미달';
  const correctedVerdict = target === null ? null : correctedRatio === null ? '보정 불가' : correctedRatio <= target ? '충족' : '미달';
  const biasFlip = target !== null && correctedRatio !== null && verdict !== correctedVerdict;
  return { lane, fixture, validation, mode, target, old, new: next, ratio, correctedRatio, verdict,
    correctedVerdict, biasFlip, ratioCorrectionWidth: correctedRatio === null ? null : Math.abs(correctedRatio - ratio),
    runRatios: next.runs.map((run, index) => run.metric.median / old.runs[index].metric.median) };
}

const official = [], updateSplit = [], phaseDiagnostics = [], axis = [];
for (const lane of ['core', 'react']) for (const fixture of fixtures) {
  for (const validation of branch(fixture) ? ['off', 'on'] : ['off']) {
    for (const mode of ['mount', 'update']) official.push(pair(lane, fixture, validation, mode));
    for (const mode of ['update-first', 'update-later']) updateSplit.push(pair(lane, fixture, validation, mode));
  }
}
for (const fixture of fixtures) for (const validation of branch(fixture) ? ['off', 'on'] : ['off']) {
  for (const mode of ['mount', 'update', 'update-first', 'update-later']) phaseDiagnostics.push(pair('react-phases', fixture, validation, mode));
}
for (const count of [5, 10, 20, 40]) for (const mode of ['mount', 'update', 'update-first', 'update-later'])
  axis.push(pair('core-axis', `oneOf-${count}`, 'off', mode));
assert.equal(manifest.length, 438);
const axisUpdates = axis.filter(row => row.mode === 'update');
const trend = Object.fromEntries(['active', ...phaseNames].map(phase => {
  const values = axisUpdates.map(row => phase === 'active' ? row.new.active.median : row.new.phases[phase].time.median);
  return [phase, { branchCounts: [5, 10, 20, 40], newMediansMs: values,
    oldMediansMs: axisUpdates.map(row => phase === 'active' ? row.old.active.median : row.old.phases[phase].time.median),
    endpointRatio: values[0] > 0 ? values.at(-1) / values[0] : null,
    endpointSlopeMsPerBranch: (values.at(-1) - values[0]) / 35,
  }];
}));
const criteria = official.filter(row => branch(row.fixture) && row.validation === 'off').map(row => {
  const diagnostic = row.lane === 'react' ? phaseDiagnostics.find(candidate => candidate.fixture === row.fixture &&
    candidate.mode === row.mode && candidate.validation === 'off') : row;
  const rawShareRatio = diagnostic.new.renderCommit.median / diagnostic.old.renderCommit.median;
  if (row.lane === 'react') assert(diagnostic.old.renderCommit.median > 0 && diagnostic.new.renderCommit.median > 0);
  const phaseEvidence = phaseNames.map(phase => ({ phase,
    oldMs: diagnostic.old.phases[phase].time.median, newMs: diagnostic.new.phases[phase].time.median,
    deltaMs: diagnostic.new.phases[phase].time.median - diagnostic.old.phases[phase].time.median,
    oldCalls: diagnostic.old.phases[phase].calls.median, newCalls: diagnostic.new.phases[phase].calls.median,
  })).filter(value => value.deltaMs > 0).toSorted((a, b) => b.deltaMs - a.deltaMs).slice(0, 3);
  const correctedShareRatio = diagnostic.old.correctedRenderCommit.median > 0 && diagnostic.new.correctedRenderCommit.median >= 0
    ? diagnostic.new.correctedRenderCommit.median / diagnostic.old.correctedRenderCommit.median : null;
  return { lane: row.lane, fixture: row.fixture, mode: row.mode,
    criterion1: row.fixture.startsWith('oneOf') ? '고정 전환 갱신 축에서 증가 관측: 미충족' : 'if/then 축 추가 진단 대기',
    criterion2: '진단 대기', criterion3: '배율 및 배타 단계값 기록 완료', phaseEvidence,
    reactShare: row.lane === 'react' ? { old: diagnostic.old.renderCommit, new: diagnostic.new.renderCommit,
      rawRatio: rawShareRatio, correctedRatio: correctedShareRatio,
      verdict: rawShareRatio <= 1 ? '충족' : '미달',
      biasFlip: correctedShareRatio !== null && (rawShareRatio <= 1) !== (correctedShareRatio <= 1),
      correctionNote: '전체 span 호출 비용을 빼는 보수적 폭이며 렌더 단계의 정확한 귀속 보정은 아님' } : null,
    finalVerdict: '미충족 또는 진단 대기',
  };
});
const groupCounts = {};
for (const lane of ['core', 'react']) for (const group of ['branchless', 'expression']) {
  const rows = official.filter(row => row.lane === lane && !branch(row.fixture) &&
    (group === 'expression' ? row.fixture === 'computed-visible-derived' : row.fixture !== 'computed-visible-derived'));
  groupCounts[`${lane}-${group}`] = { rows: rows.length, met: rows.filter(row => row.verdict === '충족').length,
    missed: rows.filter(row => row.verdict === '미달').length,
    metRows: rows.filter(row => row.verdict === '충족').map(row => `${row.fixture}/${row.mode}`),
    missedRows: rows.filter(row => row.verdict === '미달').map(row => `${row.fixture}/${row.mode}`),
    correctedMet: rows.filter(row => row.correctedVerdict === '충족').length,
    correctedMissed: rows.filter(row => row.correctedVerdict === '미달').length };
}
const env = load('core', 'sample-0', 'off', 1, 'old').summary.environment;
const documentRefs = ['round-93-closing.md', 'round-85-closing.md', 'round-86-closing.md', 'round-91-owner-answers.md'];
const sourceDocuments = documentRefs.map(name => {
  const text = execFileSync('git', ['show', `origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/${name}`],
    { cwd: repo, encoding: 'utf8' });
  return { path: `architecture/reviews/${name}`, ref: 'origin/1.0.0-beta', sha256: hash(text) };
});
const summary = { title: '93C-01 공식 판정표', environment: {
  node: env.node, v8: env.v8, cpu: env.cpu, platform: env.platform, arch: env.arch,
  react: env.react, ajv: env.ajv, head: env.head, old: '@canard/schema-form@0.16.0',
  oldSource: env.oldSource, sessionStarted: manifest.map(file => file.started).sort()[0],
  sessionEnded: manifest.map(file => file.ended).sort().at(-1),
  worktree: repo, warmup: 12, samplesPerProcess: 101, pooledSamplesPerVersion: 303,
  alternatingOrder: [['old', 'new'], ['new', 'old'], ['old', 'new']],
  processes: manifest.length, explicitGc: true, sequential: true, naturalProcessExit: true,
}, method: {
  core: '86C-02 배타 단계 합 active 중앙값; 0.16.0 반환 뒤 비동기 정착 포함, timer 대기 제외',
  react: '86C-01 production react-dom/profiling + Profiler actualDuration 합 중앙값; 추가 phase span 없음',
  reactDiagnosis: '같은 세션의 별도 production phase span 실행; 코어 몫을 제외한 렌더+커밋을 배타 합으로 판단',
  statistic: '세 회차 303표본을 판별로 합친 최근접 순위 중앙값/p99; new median / old median',
  bias: '회차·버전·행별 실제 site 빈도의 빈 span 비용; raw active - sample calls × 회차별 median 비용',
  biasLimit: 'JIT/캐시/계측의 구조 변형은 보정하지 못함. 보정 폭은 신뢰구간이 아니며 공식 raw 판정을 대체하지 않음',
  firstUpdate: '새 마운트 뒤 BF 상호작용 열의 첫 한 번',
  laterUpdate: '원 BF 열이 완료된 동일 폼에서 첫 경로를 다시 실제 변경; branch는 동일 전환, 문자열은 -later, 숫자는 +1',
  synchronousComparison: '실행하지 않음; 계측 실행의 synchronous는 무계측 비교가 아니며 판정에 사용하지 않음',
}, sourceDocuments, ledger: 'architecture/ledger/test.md:504 TEST-026',
  groupCounts, officialRows: official, updateSplitRows: updateSplit, reactPhaseDiagnostics: phaseDiagnostics,
  branchAxisRows: axis, branchTrend: trend, branchCriteria: criteria,
  biasFlipsOfficial: official.filter(row => row.biasFlip).map(row => ({ lane: row.lane, fixture: row.fixture,
    mode: row.mode, raw: row.ratio, corrected: row.correctedRatio, from: row.verdict, to: row.correctedVerdict })),
  biasFlipsUpdateSplit: updateSplit.filter(row => row.biasFlip).map(row => ({ lane: row.lane, fixture: row.fixture,
    mode: row.mode, raw: row.ratio, corrected: row.correctedRatio })),
  biasFlipsBranchedReactShare: criteria.filter(row => row.reactShare?.biasFlip),
  verification: { timingSamplesChecked, activeEqualsExclusivePhaseSumMaxErrorMs: maxActiveError,
    inputFiles: manifest.length * 2, largestInputBytes: Math.max(...manifest.flatMap(file => [file.summaryBytes, file.timingsBytes])),
    timingOnly: true, valueAndRenderedPathChecks: '모든 3회차 쌍, mount/BF update/first/later의 101표본 해시 일치',
    duplicatedWorkDiagnosis: '모든 분기 행 진단 대기', g26: '미통과',
  }, artifacts: manifest,
  toolSourceSha256: Object.fromEntries(['measure-verdict-93c01.mjs', 'run-verdict-93c01.mjs', 'report-verdict-93c01.mjs']
    .map(name => [name, hash(fs.readFileSync(path.join(directory, name), 'utf8'))])),
};

const text = ['# 93C-01 공식 판정표', '',
  '## 환경과 결정 근거', '',
  `새 판은 HEAD \`${env.head}\`, 옛 판은 \`@canard/schema-form@0.16.0\` 태그의 코어와 React 바인딩입니다. ${env.cpu}, ${env.platform}/${env.arch}, **Node ${env.node}, V8 ${env.v8}**, React ${env.react}, AJV ${env.ajv}에서 같은 세션으로 측정했습니다. 측정 범위는 ${summary.environment.sessionStarted}–${summary.environment.sessionEnded}입니다.`, '',
  '기준 문서는 요청된 origin/1.0.0-beta의 93C-01, 85C-01, 86C-01·86C-02 및 91라운드 소유자 답, ledger TEST-026입니다. 원 문서 내용과 측정 도구의 SHA-256은 요약 JSON에 기록했습니다. 기존 __legacy__에는 배포 태그 이후의 변경이 있어 기준선으로 사용하지 않았으며, 실제 배포 태그 소스를 메모리에서 읽었습니다. 옛 판의 site 경로는 기존 phaseFor 분류를 위해 가상 __legacy__ 경로로 표시하며, 코드와 줄 번호는 태그 소스 기준입니다. 기존 날짜·런타임의 별도 측정 수치는 이 표의 분모로 가져오지 않았습니다. KST 자정을 넘긴 구간도 중단 없는 같은 측정 세션입니다.', '',
  '## 방법과 명령', '',
  '- 각 픽스처·검증 설정·판·회차·측정 층은 새 프로세스입니다. 회차 1 old→new, 2 new→old, 3 old→new이며, 프로세스마다 예열 12회와 표본 101회, 판마다 총 303표본입니다. 표본 전에 명시적 GC를 수행했습니다. p99는 최근접 순위(303표본의 300번째)이고 판정은 중앙값 비입니다. 개별 회차 배율도 JSON에 있습니다.',
  '- 코어는 기존 branchless-phase-diagnosis.mjs의 phaseFor/배타 span 훅/배출 조건을 그대로 사용합니다. 옛 판의 호출 반환 후 microtask·배달도 포함하며, 타이머 대기는 active에서 제외합니다. active의 중앙값은 표본별 배타 합에서 구하며, 단계별 중앙값의 합으로 대신하지 않습니다.',
  '- React 공식값은 원 86C-02 보고서처럼 추가 phase span 없는 production react-dom/profiling의 Profiler actualDuration 합입니다. 분기 행의 렌더·커밋 몫과 AJV는 별도의 production 단계 계측 실행에서 기록합니다. 계측 단계값을 무계측 Profiler 값에서 빼지 않습니다.',
  '- 계측 호출 수는 행당 표본 중앙값과 303표본 총수입니다. 비용은 실제 site 빈도로 구성한 빈 함수/빈 span의 차이를 외곽 span 안에서 재고, 각 행·판·회차당 예열 12회와 101회 교대 교정으로 구합니다. core 보정은 표본별 active−호출 수×해당 회차 median 비용입니다. React 공식값의 추가 span 수는 0이므로 보정 배율은 원 배율과 같습니다. React 자체의 production Profiler 내장 비용은 공통 조건이며 이 빈 span 모형으로 제거하지 않습니다.',
  '- 빈 span 비용은 전체 훅의 직접 비용에 대한 모형입니다. JIT·캐시·계측이 실행을 바꾸는 비용은 제거하지 못합니다. 보정 폭을 신뢰구간으로 해석하지 않고, 보정 후 결과로 공식 raw 판정을 바꾸지 않습니다. 시간 배열에 호출 수·커밋 수·추적 상세를 넣지 않고 각 summary JSON에만 저장했습니다.',
  '- 측정 명령·프로세스는 순차 실행했고 추가 에이전트·설치·git 쓰기를 실행하지 않았습니다. esbuild는 번들 후 stdin EOF로 정상 종료(code 0)한 뒤 측정했습니다. worker·실행기는 정상 종료했으며 강제 종료·timeout kill을 사용하지 않았습니다. 제품 src와 빌드 산출물은 변경하지 않았습니다.', '',
  '```sh',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/run-verdict-93c01.mjs core core-axis',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/run-verdict-93c01.mjs react react-phases',
  '# 단일 프로세스: <lane> <fixture> <off|on> <1|2|3> <old|new>',
  'node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/tools/measure-verdict-93c01.mjs core flat-50 off 1 old',
  '# 보고서: stdout의 patch chunk를 native editor로 적용합니다.',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/report-verdict-93c01.mjs --manifest',
  '```', '',
  '사전 확인에서 sample-0 core r1 및 sample-3 React/React-phase r1을 같은 세션으로 완료했고, 본 실행은 해당 완전한 쌍을 유지한 뒤 r2·r3을 이어서 수행했습니다. 예열·표본·Node/V8·HEAD·문서 및 값/경로 검증 조건은 같습니다. 최초 esbuild 종료 대기의 준비 오류 실행은 표본을 생성하지 않았고 포함하지 않았습니다.', '',
  '## 공식 표 — 85C-01 분기 없는 폼과 식만 있는 폼', '',
  `**Node ${env.node} / V8 ${env.v8}.** 시간은 ms, 호출당 비용은 µs입니다. old/new는 각 303표본의 median/p99입니다. core 마운트·갱신 ≤1.5×, React 마운트 ≤1.2×·갱신 ≤1.0×입니다. 판정은 보정 전 공식값이며 ★는 보정 폭 안에서 목표 판정이 뒤집히는 행입니다.`, '',
];

/** Render a complete timing/bias table without importing values from another measurement lane. */
function timingTable(rows, label) {
  text.push(`### ${label}`, '',
    '| 픽스처 | 작업 | old median / p99 | new median / p99 | 원 배율 | 보정 배율 | 목표·원 판정 | old 호출 median / 총수 | new 호출 median / 총수 | 빈 span old / new µs |',
    '| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | ---: |');
  for (const row of rows) text.push(`| ${row.fixture} | ${modeLabel(row.mode)} | ${mp(row.old.metric)} | ${mp(row.new.metric)} | ${fmt(row.ratio)}× | ${fmt(row.correctedRatio)}× | ${row.target === null ? row.verdict : `${row.target}×·${row.verdict}`}${row.biasFlip ? ` ★ 보정시 ${row.correctedVerdict}` : ''} | ${row.old.instrumentation.calls.median} / ${row.old.instrumentation.callsTotal} | ${row.new.instrumentation.calls.median} / ${row.new.instrumentation.callsTotal} | ${fmt(row.old.instrumentation.perCallMs.median * 1000)} / ${fmt(row.new.instrumentation.perCallMs.median * 1000)} |`);
  text.push('');
}
timingTable(official.filter(row => row.lane === 'core' && !branch(row.fixture)), '코어 — 배타 active');
timingTable(official.filter(row => row.lane === 'react' && !branch(row.fixture)), 'React — production Profiler actualDuration');
text.push('### 묶음별 판정', '', '| 묶음 | 행 수 | 충족 | 미달 | 보정시 충족 / 미달 |', '| --- | ---: | ---: | ---: | ---: |');
const groupLabels = { 'core-branchless': '코어·분기 없음', 'core-expression': '코어·식만 있음',
  'react-branchless': 'React·분기 없음', 'react-expression': 'React·식만 있음' };
for (const [name, counts] of Object.entries(groupCounts)) text.push(`| ${groupLabels[name]} | ${counts.rows} | ${counts.met} | ${counts.missed} | ${counts.correctedMet} / ${counts.correctedMissed} |`);
text.push('', '### 편향 경계 행', '');
for (const row of summary.biasFlipsOfficial) text.push(`- ${row.lane} ${row.fixture}/${modeLabel(row.mode)}: ${fmt(row.raw)}× → ${fmt(row.corrected)}×, ${row.from} → ${row.to}.`);
if (!summary.biasFlipsOfficial.length) text.push('공식 일반 행에는 원/보정 판정의 뒤집힘이 없습니다.');
text.push('', '## BF 갱신 수치와 마운트 직후 첫 갱신·이후 갱신', '',
  '공식 표의 BF 갱신은 기존 상호작용 열 전체입니다(flat/nested 10회, array/sample 1회, derived 3회, oneOf/if-then 2회). 아래는 새 마운트의 첫 한 번과, 원 열이 완료된 같은 폼의 첫 경로를 실제로 다시 변경한 한 번입니다. 서로 다른 작업량이므로 BF 열 전체를 첫 한 번의 값으로 대신하지 않습니다. 이후 갱신의 숫자 값은 +1, 문자열은 -later이며, branch는 원 열의 마지막 복귀 뒤 같은 분기 전환을 반복합니다.', '');
timingTable(updateSplit.filter(row => row.lane === 'core' && row.validation === 'off'), '코어 첫·이후 갱신');
timingTable(updateSplit.filter(row => row.lane === 'react' && row.validation === 'off'), 'React 첫·이후 갱신');
text.push('보충 갱신 행의 모든 편향 경계와 검증 ON 수치는 JSON의 biasFlipsUpdateSplit/updateSplitRows에 있습니다.', '',
  '## 공식 분기·조건 폼 — 91라운드의 세 기준', '',
  'oneOf/if-then의 배율은 목표 판정에 사용하지 않습니다. (1) 같은 전환에서 무관한 분기의 수가 늘어도 비용이 늘지 않아야 하며, (2) 단계별 중복 작업·쓰이지 않는 장부가 없어야 하고, (3) 남은 배율과 단계별 까닭을 기록해야 합니다. (2)는 시간/호출 수만으로 작업의 의미를 확정할 수 없어 모든 해당 행을 **진단 대기**로 둡니다. if/then OFF는 validator 없이 조건 가드가 비활성이므로 조건 평가 성능 통과의 근거가 아닙니다.', '');
timingTable(official.filter(row => row.lane === 'core' && branch(row.fixture) && row.validation === 'off'), '코어 분기·조건 — 기록용 배율');
timingTable(official.filter(row => row.lane === 'react' && branch(row.fixture) && row.validation === 'off'), 'React 분기·조건 — production Profiler 기록용 배율');
text.push('### 분기 수 축 — 건드리는 두 분기를 고정한 oneOf 갱신', '',
  'BF 원 행은 0→마지막→0을 유지합니다. 별도 분기 수 축은 5/10/20/40개 모두 **kind_0→kind_4→kind_0**으로 고정하고, 각 분기의 payload 3개와 공통 필드도 같게 유지했습니다. 따라서 건드리지 않은 분기는 각각 3/8/18/38개입니다. 검증 OFF, 구독 없는 코어, 같은 배타 active 방법입니다. 단계별 중앙값은 따로 구했으므로 아래 각 열의 합이 active 중앙값과 같을 필요는 없습니다.', '',
  '| 분기 수 | 판 | active median / p99 | 분석 | 생성 | 정착 | 검증 등록 | 검증 실행 | 배달 | 기타 | span 호출 median | 빈 span µs |',
  '| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const row of axisUpdates) for (const version of ['old', 'new']) {
  const value = row[version];
  text.push(`| ${row.fixture.slice(6)} | ${version} | ${mp(value.active)} | ${['analysis', 'creation', 'settlement', 'validation-registration', 'validation-run', 'delivery', 'other'].map(phase => fmt(value.phases[phase].time.median)).join(' | ')} | ${value.instrumentation.calls.median} | ${fmt(value.instrumentation.perCallMs.median * 1000)} |`);
}
text.push('', `new 정착은 ${trend.settlement.newMediansMs.map(value => fmt(value)).join(' → ')} ms이며 5→40에서 ${fmt(trend.settlement.endpointRatio)}×입니다. new active도 ${trend.active.newMediansMs.map(value => fmt(value)).join(' → ')} ms입니다. 전환 대상과 payload를 고정했는데 정착이 증가하므로 기준 (1)은 미충족입니다. 분석·검증 등록·검증 실행은 OFF 갱신에서 0이며, 생성·배달·기타는 위 값으로 따로 기록합니다. 분기 수별 p99·각 단계 호출 수·마운트·첫/이후 갱신 및 보정 active는 JSON에 있습니다.`, '',
  '### React 분기 행 — 코어 몫을 제외한 배타 렌더·커밋', '',
  '별도 production 단계 계측 실행에서 core=분석+생성+정착+검증 등록+검증 실행+배달+기타를 표본별 active에서 빼면 react-render+react-commit입니다. 이는 같은 계측 실행 안의 차이이며, 공식 Profiler에서 다른 실행의 core 시간을 빼는 계산이 아닙니다. 보정 몫은 전체 span 호출 비용을 빼는 보수적 경계 모형으로, 정확한 렌더 귀속 보정은 아닙니다.', '',
  '| 픽스처 | 작업 | old 렌더+커밋 median/p99 | new 렌더+커밋 median/p99 | 원 몫 배율 | 경계 모형 보정 배율 | 원 기준 판정 | 단계 span old / new | 빈 span old / new µs | 기준 (2) |',
  '| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: | --- |');
for (const criterion of criteria.filter(row => row.lane === 'react')) {
  const diag = phaseDiagnostics.find(row => row.fixture === criterion.fixture && row.mode === criterion.mode && row.validation === 'off');
  const share = criterion.reactShare;
  text.push(`| ${criterion.fixture} | ${modeLabel(criterion.mode)} | ${mp(share.old)} | ${mp(share.new)} | ${fmt(share.rawRatio)}× | ${fmt(share.correctedRatio)}× | ${share.verdict}${share.biasFlip ? ' ★ 편향 경계' : ''} | ${diag.old.instrumentation.calls.median} / ${diag.new.instrumentation.calls.median} | ${fmt(diag.old.instrumentation.perCallMs.median * 1000)} / ${fmt(diag.new.instrumentation.perCallMs.median * 1000)} | 진단 대기 |`);
}
text.push('', '### 남은 배율의 배타 단계 근거', '',
  '아래는 같은 단계 계측 쌍의 각 중앙값입니다. 코어 old/new 차이는 generic 구조의 분석·형상 생성·정착·배달이 차지한 위치를 보여 줍니다. React 값에서는 렌더·커밋을 별도로 보입니다. 시간이 큰 단계가 관측 원인이며, 작업이 중복되거나 장부가 불필요한지는 이 수치만으로 판정하지 않습니다. 원 보고서의 이름 분류에 잡히지 않는 새 정적 로드 내부 작업은 nodeFromJSONSchema의 기타 span에 포함되며 누락시키지 않습니다.', '',
  '| 층 | 픽스처 | 작업 | 분석 old→new | 생성 old→new | 정착 old→new | 검증 등록 old→new | 검증 실행 old→new | 배달 old→new | 렌더 old→new | 커밋 old→new | 기타 old→new |',
  '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const row of [...official.filter(row => row.lane === 'core' && row.validation === 'off'),
  ...phaseDiagnostics.filter(row => row.validation === 'off' && ['mount', 'update'].includes(row.mode))]) {
  text.push(`| ${row.lane} | ${row.fixture} | ${modeLabel(row.mode)} | ${phaseNames.map(phase => `${fmt(row.old.phases[phase].time.median)}→${fmt(row.new.phases[phase].time.median)}`).join(' | ')} |`);
}
text.push('', '### 분기 행별 관측 이유', '',
  '다음은 단계 중앙값 차이가 큰 순서의 관측 근거입니다. 단계 중앙값의 차이를 더해 총 차이로 해석하지 않으며, 함수 내부의 중복·장부 필요성 판단은 후속 진단에 남깁니다.', '',
  '| 층 | 픽스처 | 작업 | 남은 공식 배율 | 추가 시간이 보이는 단계와 호출 수 old→new | 기준 (2) |',
  '| --- | --- | --- | ---: | --- | --- |');
for (const criterion of criteria) {
  const row = official.find(row => row.lane === criterion.lane && row.fixture === criterion.fixture &&
    row.mode === criterion.mode && row.validation === 'off');
  const evidence = criterion.phaseEvidence.map(value => `${phaseLabels[value.phase]} ${fmt(value.oldMs)}→${fmt(value.newMs)} ms (호출 ${value.oldCalls}→${value.newCalls})`).join('; ');
  text.push(`| ${criterion.lane} | ${criterion.fixture} | ${modeLabel(criterion.mode)} | ${fmt(row.ratio)}× | ${evidence || '추가 시간이 보이는 단계 없음'} | 진단 대기 |`);
}
text.push('', '### 검증 ON — AJV 몫 기록 전용', '',
  'AJV compile/compileGuard/validate/guard는 중첩 배타 span으로 따로 합산했습니다. ON 원/보정 배율은 기록만 하며 OFF와 서로 다른 실행의 차이를 AJV로 오인하지 않습니다. 점유율은 AJV 중앙값 / active 중앙값입니다. 비-AJV 등록·정착·배달은 JSON 단계값에서 별도로 확인할 수 있습니다.', '',
  '| 층 | 픽스처 | 작업 | ON 원 배율 | ON 보정 배율 | old AJV median / p99 | new AJV median / p99 | old AJV active 점유율 | new AJV active 점유율 |',
  '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |');
for (const lane of ['core', 'react-phases']) for (const row of (lane === 'core' ? official : phaseDiagnostics)
  .filter(row => row.lane === lane && row.validation === 'on' && ['mount', 'update'].includes(row.mode)))
  text.push(`| ${lane} | ${row.fixture} | ${modeLabel(row.mode)} | ${fmt(row.ratio)}× | ${fmt(row.correctedRatio)}× | ${mp(row.old.ajv)} | ${mp(row.new.ajv)} | ${fmt(100 * row.old.ajv.median / row.old.active.median)}% | ${fmt(100 * row.new.ajv.median / row.new.active.median)}% |`);
text.push('');
timingTable(official.filter(row => row.lane === 'core' && row.validation === 'on'), '검증 ON 코어 공식 기록 — active');
timingTable(official.filter(row => row.lane === 'react' && row.validation === 'on'), '검증 ON React 공식 기록 — Profiler');
text.push('', '## 무계측 동기 쌍 비교 — 공식 판정과 별도', '',
  '이번 작업에서는 무계측 synchronous 비교를 실행하지 않았습니다. 시간 파일의 synchronous는 계측 실행에서 호출 반환 시점을 기록한 진단값이므로 무계측 수치가 아니며, 옛 판의 뒤이은 정착도 포함하지 않습니다. 이 값을 공식 active/Profiler 판정의 분모나 분자로 사용하지 않았습니다. 93C-01이 바로잡은 이전 (ii)의 “7행 가운데 둘 충족”도 이 공식 표의 판정 근거로 사용하지 않았습니다.', '',
  '## 산출물 검증과 G26', '',
  `${manifest.length}개 자연 종료 측정 프로세스, ${manifest.length * 2}개 입력 JSON, ${timingSamplesChecked}개 작업별 시간 표본을 검증했습니다. 시간 파일은 시간 숫자만 포함하고 호출·커밋 수와 site 상세는 summary에 있습니다. 최대 입력 파일은 ${summary.verification.largestInputBytes}바이트이며 모두 5,000,000바이트 이하입니다. active와 배타 합의 최대 오차는 ${maxActiveError} ms이고, 모든 쌍의 값 및 React 렌더 경로 해시가 일치했습니다. 개별 프로세스 파일의 목록·크기·SHA-256·실행 시각은 verdict-93c01-summary.json의 artifacts에 있습니다.`, '',
  '공식 일반 행의 미달이 남아 있고 oneOf 고정 전환의 정착 비용이 무관한 분기 수에 따라 증가합니다. 분기 행 기준 (2)는 진단 대기이므로 **G26은 미통과**입니다.', '',
);
const markdown = text.join('\n');
const summaryText = JSON.stringify(summary) + '\n';
assert(Buffer.byteLength(summaryText) <= 5_000_000 && Buffer.byteLength(markdown) <= 5_000_000);
const patch = `*** Begin Patch\n*** Add File: ${path.join(output, 'verdict-93c01.md')}\n${markdown.split('\n').map(line => '+' + line).join('\n')}\n*** Add File: ${path.join(output, 'verdict-93c01-summary.json')}\n${summaryText.trimEnd().split('\n').map(line => '+' + line).join('\n')}\n*** End Patch`;
const chunkSize = 40_000;
if (process.argv.includes('--manifest')) console.log(JSON.stringify({ chunks: Math.ceil(patch.length / chunkSize),
  patchCharacters: patch.length, markdownBytes: Buffer.byteLength(markdown), summaryBytes: Buffer.byteLength(summaryText),
  groupCounts, biasFlips: summary.biasFlipsOfficial, branchTrend: trend.settlement, verification: summary.verification }));
else {
  const index = Number(process.argv.find(arg => arg.startsWith('--chunk='))?.slice(8));
  assert(Number.isInteger(index) && index >= 0 && index < Math.ceil(patch.length / chunkSize));
  console.log(JSON.stringify(patch.slice(index * chunkSize, (index + 1) * chunkSize)));
}
