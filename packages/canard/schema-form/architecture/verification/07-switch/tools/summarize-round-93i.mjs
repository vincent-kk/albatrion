// Invoked by measure-round-90-baseline.mjs --summarize-paired --round93i.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const verification = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = path.resolve(verification, '../../..');
const fixtures = ['flat-500', 'nested-d5-f4', 'array-1000', 'computed-visible-derived', 'oneOf-20'];
const old = {
  paired: { 'flat-500': [2.5434, .1114], 'nested-d5-f4': [4.9585],
    'array-1000': [12.1019, .1781], 'computed-visible-derived': [.3058, .0399], 'oneOf-20': [.5308, .0266] },
  phases: { 'flat-500': [4.6643, 2.3811], 'nested-d5-f4': [11.3944],
    'array-1000': [29.8274, .4465], 'computed-visible-derived': [.3297, .1110], 'oneOf-20': [.9584, .2247] },
  react: { 'flat-500': [51.8588, 1.5068], 'nested-d5-f4': [143.4266, 1.3448],
    'array-1000': [497.3110, 2.4785], 'computed-visible-derived': [1.4917, .4722], 'oneOf-20': [2.1550, 1.0020] },
};
const verifiedBundlePrograms = {
  phases: {
    H: { programSha256: 'dc5ddef45f93a6fc7d106f7b618ba945c79df80dd0495a0b559a7e7a1eed4528',
      raw: ['94eed259c9bbbd552d1e46db360e3b4830667af8392842a39fd896c48ba83699', 'c546d63e55f3fefacb0440e0ab0466552de6d7a83c1ec9386a0474e8946d8b48'] },
    W: { programSha256: 'd23ae35f4bef488cc3c2219e30acb1d3e12d1662c622c30e7fc65db19e54256e',
      raw: ['5a2e0ab775ea69225af1a2eb40f1d2748bde7a52ac9d2c0abe661fa91471ceda', 'f135e1f2358e1486ac2a98b6fb597571de5a7d9516f81701299a6f47342693b0'] },
  },
  react: {
    H: { programSha256: 'f0c40db0dd94824b2f7b34ddf080f466a34a3accdbe2a78893fb2c058128d018',
      raw: ['aa81207f3d991c8bde283711b9f2045e7f295a4848c89aaaea00060a6153a674', '5e674d5dc39723812369960d2d3990357067825373c10cb41a34c0ffe591084c'] },
    W: { programSha256: '19174136060c926524098769a11cce1e193063608c1d689a3919c79cbb18e451',
      raw: ['5ac1b69ae916927d537c64b03c8741dd78b48687dc54fae194b3d2c78db15a6f', '4b94dc5636ad716a80ad78e6acc81a8da536904901d0165275bbca6d05e494ce'] },
  },
  method: '첫 flat phase/React 회차는 worktree 루트, 이후는 PKG에서 실행되었습니다. esbuild가 출력한 경로 주석 때문에 raw SHA만 달랐습니다. ROUND93I_BUNDLE_PROBE=1로 두 cwd에서 H/W·두 층을 다시 번들하고 TypeScript printer removeComments의 program SHA 일치를 확인했습니다. 실행 AST는 동일하며 표본은 재측정·교체하지 않았습니다.',
};
function read(file) { return JSON.parse(fs.readFileSync(path.join(verification, file), 'utf8')); }
function metric(values) {
  const sorted = values.toSorted((a, b) => a - b);
  assert(sorted.length && sorted.every(value => Number.isFinite(value) && value >= 0));
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], sampleCount: sorted.length };
}
/** Reject metadata, counters and traces in timing files, including nested phase arrays. */
function assertTimings(value) {
  if (Array.isArray(value)) {
    assert(value.length === 101 && value.every(item => typeof item === 'number' && Number.isFinite(item) && item >= 0));
  } else {
    assert(value && typeof value === 'object');
    for (const item of Object.values(value)) assertTimings(item);
  }
}
const results = {}, sessions = [];
for (const lane of ['paired', 'phases', 'react']) {
  const rows = [], runs = [];
  const bundleDigests = {};
  for (const fixture of fixtures) {
    const combined = { H: { mount: [], update: [] }, W: { mount: [], update: [] } };
    const phaseArrays = { H: { mount: {}, update: {} }, W: { mount: {}, update: {} } };
    let observation;
    const pairs = [];
    for (let run = 1; run <= 3; run++) {
      const pair = {};
      let previous;
      for (const side of run === 2 ? ['W', 'H'] : ['H', 'W']) {
        const stem = `round-93i-${lane}-${fixture}-r${run}-${side}`;
        const timing = read(`${stem}-timings.json`), summary = read(`${stem}-summary.json`);
        assertTimings(timing);
        assert.equal(summary.fixture, fixture); assert.equal(summary.variant, side); assert.equal(summary.run, run);
        assert.equal(summary.environment.warmup, 20); assert.equal(summary.environment.samples, 101);
        assert.equal(summary.environment.validation, 'off');
        if (previous) assert(previous.environment.endedAt <= summary.environment.startedAt);
        previous = summary;
        if (observation) assert.equal(summary.observationsSha256, observation);
        observation = summary.observationsSha256;
        const digest = summary.environment.bundleSha256;
        const accepted = verifiedBundlePrograms[lane]?.[side]?.raw;
        if (accepted) assert(accepted.includes(digest));
        else if (bundleDigests[side]) assert(bundleDigests[side].includes(digest));
        const saved = bundleDigests[side] ??= [];
        if (!saved.includes(digest)) saved.push(digest);
        sessions.push({ lane, fixture, run, side, start: summary.environment.startedAt, end: summary.environment.endedAt });
        runs.push(summary); pair[side] = summary;
        for (const mode of ['mount', 'update']) {
          combined[side][mode].push(...timing[mode]);
          for (const [phase, times] of Object.entries(timing[`${mode}Phases`] ?? {}))
            (phaseArrays[side][mode][phase] ??= []).push(...times);
        }
      }
      pairs.push(pair);
    }
    for (const mode of ['mount', 'update']) {
      if (fixture === 'nested-d5-f4' && mode === 'update' || fixture === 'oneOf-20' && mode === 'mount') continue;
      const before = metric(combined.H[mode]), after = metric(combined.W[mode]);
      assert.equal(before.sampleCount, 303); assert.equal(after.sampleCount, 303);
      const oldMedian = old[lane][fixture][mode === 'mount' ? 0 : 1];
      const multiple = lane === 'react' ? (mode === 'mount' ? 1.2 : 1) : 1.5;
      const phaseStatistics = {};
      for (const side of ['H', 'W']) phaseStatistics[side] = Object.fromEntries(
        Object.entries(phaseArrays[side][mode]).map(([phase, times]) => [phase, metric(times)]));
      rows.push({ fixture, mode, before, after, changePercent: (after.median / before.median - 1) * 100,
        pairs: pairs.map((pair, index) => ({ run: index + 1, order: index === 1 ? 'W→H' : 'H→W',
          before: pair.H[mode], after: pair.W[mode], changePercent: (pair.W[mode].median / pair.H[mode].median - 1) * 100 })),
        gate85C01: { oldVersion: '0.16.0', oldMedian, multiple, ceiling: oldMedian * multiple,
          ratio: after.median / oldMedian, verdict: after.median <= oldMedian * multiple ? '충족' : '미달',
          scope: lane === 'paired' ? '무계측 synchronous 대조의 수치 판정' : lane === 'phases' ?
            '65C-01 배타 active, 비동기 정착 포함·대기 제외' : '86C-01 production profiling actualDuration 합',
          source: 'remeasure-86c02.md의 0.16.0 중앙값; old Node v24.20.0 / 현재 v26.10.0' },
        phases: phaseStatistics });
    }
  }
  results[lane] = { rows, runs, bundleDigests };
}
sessions.sort((a, b) => a.start.localeCompare(b.start));
for (let index = 1; index < sessions.length; index++) assert(sessions[index - 1].end <= sessions[index].start,
  'Timing processes must not overlap');
const costs = [];
for (const fixture of fixtures) {
  const before = read(`round-93i-costs-${fixture}-H-summary.json`);
  const after = read(`round-93i-costs-${fixture}-W-summary.json`);
  assert.equal(before.nodeCount, after.nodeCount);
  assert.equal(before.maxDepth, after.maxDepth);
  assert.equal(before.observationsSha256, after.observationsSha256);
  costs.push({ fixture, before, after });
}
const report = {
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: pkg, encoding: 'utf8' }).trim(),
  sourceState: '승인 설계 (i) 정적 첫 로드; af1904cf9의 (ii) 분기 없는 capability를 재사용',
  methodology: '픽스처·측정 층마다 H→W, W→H, H→W, 각 판 새 프로세스·예열 20·101×3 표본·nearest-rank 중앙값/p99. 기존 90 도구의 무계측 코어, 별도 65C-01 phase, 86C-01 production profiling React. validation off·명시 GC·번들은 메모리에서만 생성하고 esbuild는 측정 전 종료. 시간 프로세스가 겹치지 않음을 timestamp로 확인.',
  limits: '다른 테스트·명령·에이전트를 측정 중 실행하지 않았습니다. OS·GUI·상주 도구 서비스는 유지됩니다. old 환경은 Node24.20.0, 현재는 Node26.10.0입니다. phase 계측은 timer 비용이 있으며, 무계측 ms나 React actualDuration에서 phase 중앙값을 빼거나 직접 합산하지 않습니다. 작은 변동을 제품 변경의 인과로 확정하지 않습니다.',
  rows: results.paired.rows, coreActiveRows: results.phases.rows, reactRows: results.react.rows,
  runs: { core: results.paired.runs, phases: results.phases.runs, react: results.react.runs },
  bundleDigests: Object.fromEntries(Object.entries(results).map(([lane, value]) => [lane, value.bundleDigests])),
  verifiedBundlePrograms,
  sessions, costs,
  costsMethod: '시간과 별도 새 프로세스에서 실제 mount 계산·assembly·배달 visitor·Map/Set 생성 수를 셉니다. entry 예약용 기존 Set을 그대로 사용하여 신규 order cell은 0입니다. native Set capacity 상각 byte와 release 후 scratch byte는 별도 in-memory V8 heap snapshot으로 얻고 heap 원본은 저장하지 않습니다.',
  speedAndMemory: [
    { change: '첫 로드 eligibility', speed: '기존 분석 capability 수집에 고정 검사를 결합; literal default 데이터 L에 O(L) descriptor 검사, 첫 load는 O(1) 조회', memory: '청사진당 weak-sidecar bool O(1), literal 검사 active container 조상 O(depth)와 조상별 key 목록 임시 저장; 공개 Blueprint shape 유지' },
    { change: 'entry 예약 + post-order 완성', speed: 'occurrence당 해석·assemble·project 1회; dirty/선언·형상 재선택·초기 출력 재조립 제거; container default missing 판정은 source span 합만큼 읽고 겹친 후보 최악 O(LD), required R·자식 C의 배열 membership O(CR) 유지', memory: '기존 O(N) delivery Set 유지, 새 O(N) order cells 0; live DFS O(D), frame 객체는 총 O(N) 생성·즉시 해제 가능; default 객체의 shared entry cache O(S)' },
    { change: 'batched commit + buffered diagnostics', speed: 'post-order commit 한 번, root 완료 후 기존 dispatcher의 reservation drain 및 listener snapshot O(N) 유지; 실제 경고 정렬 O(W log W)', memory: 'scratch·selected IDs·dirty·빈 자동쓰기/exit/disposal 집합 없음, 실제 warning cells O(W); 필요 출력 payload/revision O(N) 유지' },
    { change: '후속 generic update', speed: '기존 경로 유지; W의 첫 update에서 generic scratch를 최초 생성하는 고정 비용 이동', memory: '업데이트를 하지 않는 root는 scratch 0; 첫 update 이후 기존 scratch 보유' },
  ],
  verification: { genericMatrix: '23/23', staticMatrix: '23/23', costTests: '2/2',
    full: { filesPassed: 412, testsPassed: 3134, todo: 1, failed: 4,
      exceptions: 'render/react18마다 EVENT-070 useLayoutEffect/useEffect 두 건만 실패' },
    typecheck: 0, eslint: 0, isolation: { exit: 0, checkedFiles: 1602 } },
  openQuestions: [], ledgerChanges: [],
};
const serialized = JSON.stringify(report, null, 2) + '\n';
assert(Buffer.byteLength(serialized) <= 5_000_000);
fs.writeFileSync(path.join(verification, 'round-93i-baseline-summary.json'), serialized, { flag: 'wx' });
for (const [lane, result] of Object.entries(results)) {
  console.log(lane);
  for (const row of result.rows) console.log(`${row.fixture} ${row.mode}: ${row.before.median.toFixed(6)} → ${row.after.median.toFixed(6)} ms (${row.changePercent.toFixed(2)}%); old ${row.gate85C01.ratio.toFixed(3)}× ${row.gate85C01.verdict}`);
}
console.log(`측정 ${sessions.length}개 겹침 없음; summary ${Buffer.byteLength(serialized)} bytes`);
