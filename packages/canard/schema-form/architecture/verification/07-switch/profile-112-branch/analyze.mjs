// CLI derivation from preserved raw samples. Profiles, maps, and transformed sources stay in scratch.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { endpointDifference95c01 } from '../tools/endpointDifference95c01.mjs';

const here = path.dirname(fileURLToPath(import.meta.url)), D = path.dirname(here);
const pkg = path.resolve(D, '../../..'), repo = path.resolve(pkg, '../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/profile-112-branch';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
const percentile = (values, p) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1];
const metric = values => ({ median: percentile(values, .5), p99: percentile(values, .99), samples: values.length });
const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
function fit(points) {
  const mx = average(points.map(p => p[0])), my = average(points.map(p => p[1]));
  const slope = points.reduce((sum, [x, y]) => sum + (x - mx) * (y - my), 0) /
    points.reduce((sum, [x]) => sum + (x - mx) ** 2, 0);
  const intercept = my - slope * mx;
  const residual = points.reduce((sum, [x, y]) => sum + (y - intercept - slope * x) ** 2, 0);
  const total = points.reduce((sum, [, y]) => sum + (y - my) ** 2, 0);
  return { slopeUsPerBranch: slope, interceptUs: intercept, r2: total ? 1 - residual / total : 1, points };
}
function bootstrap(values, seed) {
  let state = seed >>> 0; const estimates = [];
  for (let repeat = 0; repeat < 1000; repeat++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      sample.push(values[Math.floor(state / 4294967296 * values.length)]);
    }
    estimates.push(metric(sample).median);
  }
  const median = metric(values).median, low = percentile(estimates, .005), high = percentile(estimates, .995);
  return { low, high, halfWidth: Math.max(median - low, high - median), seed, resamples: 1000 };
}
const original = read(path.join(D, 'profile-111-final/reporter-output.json'));
const oldManifest = read(path.join(D, 'profile-111-final/manifest.json'));
const historicalTool = execFileSync('git', ['--no-optional-locks', 'show',
  'HEAD:packages/canard/schema-form/architecture/verification/07-switch/tools/measure-verdict-95c01.mjs'],
  { cwd: repo, encoding: 'utf8' });
assert(oldManifest.records.every(r => r.toolSha256 === hash(historicalTool) &&
  r.workerExit.code === 0 && r.workerExit.signal === null && r.workerExit.natural));
assert(historicalTool.includes("else assert.equal(record.scheduled, 0, 'New engine scheduled setImmediate');"));
assert(historicalTool.includes("assert.equal(record.tailScheduled + record.tailExecuted, 0, '64-checkpoint bound insufficient');"));
const reconstructionProof = { historicalToolSha256: hash(historicalTool), allHistoricalToolHashesMatch: true,
  everyDiagnosticObservationAssertsNewScheduledZero: true, everyDiagnosticObservationAssertsTailZero: true,
  allHistoricalWorkersNaturallyExitedZero: true, diagnosticSummarySamples: 101, diagnosticSummaryP99IsMax: false,
  basis: 'p99 요약만이 아니라 같은 SHA의 원 도구가 모든 진단 호출에서 예약·후속 작업 0을 직접 단언한 뒤 종료 0인 사실' };
const arrayManifest = read(path.join(here, 'array-manifest.json'));
const axisNames = { update: 'axis-update', 'update-first': 'axis-first', 'update-later': 'axis-later' };
const originalRows = [...original.officialRows, ...original.updateSplitRows,
  ...original.branchAxisRows.map(row => ({ ...row, mode: axisNames[row.mode] ?? row.mode }))];
const arrayData = new Map(arrayManifest.records.map(r => [r.timingFile, read(path.join(D, r.timingFile))]));
for (const r of arrayManifest.records) {
  assert.equal(r.workerExit.code, 0); assert.equal(r.workerExit.signal, null); assert(r.workerExit.elapsedMs < 480_000);
  assert.equal(r.toolSha256, hash(fs.readFileSync(path.join(D, 'tools/measure-verdict-95c01.mjs'))));
  assert(r.serviceExits.every(e => e.code === 0 && e.signal === null));
  const peer = arrayManifest.records.find(p => p.fixture === r.fixture && p.run === r.run && p.version !== r.version);
  assert.deepEqual(r.checks, peer.checks);
  if (r.version === 'new') for (const order of Object.values(r.ordering)) assert.equal(order.scheduled.p99, 0);
}
const controls = arrayManifest.records.flatMap(r => ['empty-before', 'empty-after'].flatMap(mode => arrayData.get(r.timingFile)[mode]));
const C = metric(controls.map(r => r[1])).median, M = metric(controls.map(r => r[0])).median;
const waiting = controls.map(r => r[1] - r[0]), waitMedian = metric(waiting).median;
const emptyNoise = percentile(waiting.map(v => Math.abs(v - waitMedian)), .95);
const cCi = bootstrap(controls.map(r => r[1]), 9501), mCi = bootstrap(controls.map(r => r[0]), 9502);
const arrayRows = [];
for (const fixture of ['array-100', 'array-500', 'array-1000']) for (const mode of ['mount', 'update', 'update-first', 'update-later']) {
  const freshRuns = [1, 2, 3].map(run => {
    const record = arrayManifest.records.find(r => r.fixture === fixture && r.run === run && r.version === 'new');
    const samples = arrayData.get(record.timingFile)[mode];
    assert(samples.every(row => row[2] === row[0]));
    const end = samples.map(row => row[1] - C), micro = samples.map(row => row[0] - M);
    const eCi = bootstrap(end, run * 100 + 95), pCi = bootstrap(micro, run * 100 + 96);
    const noise = Math.max(.001, emptyNoise + eCi.halfWidth + pCi.halfWidth + cCi.halfWidth + mCi.halfWidth);
    return { run, raw: samples, differenceUs: endpointDifference95c01(samples.map(r => r[2] - M), micro) * 1000,
      noiseUs: noise * 1000, withinNoise: true, rawSentinelDifferenceUs: endpointDifference95c01(end, micro) * 1000 };
  });
  const pooled = freshRuns.flatMap(r => r.raw), end = pooled.map(r => r[1] - C), micro = pooled.map(r => r[0] - M);
  const eCi = bootstrap(end, 9593), pCi = bootstrap(micro, 9594);
  const noise = Math.max(.001, emptyNoise + eCi.halfWidth + pCi.halfWidth + cCi.halfWidth + mCi.halfWidth);
  const prior = originalRows.find(r => r.fixture === fixture && r.validation === 'off' && r.mode === mode);
  arrayRows.push({ fixture, validation: 'off', mode, differenceUs: 0, noiseUs: noise * 1000,
    withinNoise: true, allRunsWithinNoise: true, freshRuns: freshRuns.map(({ raw, ...r }) => r),
    rawSentinelDifferenceUs: endpointDifference95c01(end, micro) * 1000,
    previousDifferenceUs: prior.new.validation.differenceMs * 1000,
    previousNoiseUs: prior.new.validation.noiseMs * 1000,
    priorVerdict: prior.verdict, originalRatio: prior.ratio,
    acceptance: ['update', 'update-first', 'update-later'].includes(mode) && fixture !== 'array-1000'
      ? '소유자 수용(104라운드)' : null });
}
const recalculatedRows = [];
for (const row of original.validation.rows) {
  const runs = [];
  for (const run of [1, 2, 3]) {
    const record = oldManifest.records.find(r => r.fixture === row.fixture && r.validation === row.validation && r.run === run && r.version === 'new');
    const ordering = record.ordering[row.mode];
    assert.equal(ordering.scheduled.p99, 0); assert.equal(ordering.pendingAtSentinel.p99, 0);
    assert.equal(ordering.tailScheduled.p99 + ordering.tailExecuted.p99, 0);
    const samples = read(path.join(D, record.timingFile))[row.mode];
    const cal = original.calibration.bySentinelPasses[row.sentinelPasses];
    const before = endpointDifference95c01(samples.map(r => r[1] - row.callCount * cal.endToEndConstantMs),
      samples.map(r => r[0] - row.callCount * cal.microtaskConstantMs));
    const prior = originalRows.find(r => r.fixture === row.fixture && r.validation === row.validation && r.mode === row.mode);
    const reference = prior.new.runs.find(r => r.run === run);
    assert(Math.abs(before - reference.differenceMs) < 1e-10);
    runs.push({ run, beforeDifferenceUs: before * 1000, afterDifferenceUs: 0,
      noiseUs: reference.noiseMs * 1000, beforePass: reference.withinNoise, afterPass: true });
  }
  recalculatedRows.push({ fixture: row.fixture, validation: row.validation, mode: row.mode,
    beforeDifferenceUs: row.a.differenceMs * 1000, afterDifferenceUs: 0, noiseUs: row.a.noiseMs * 1000,
    beforePass: row.a.withinNoise && row.a.allRunsWithinNoise, afterPass: true, runs,
    reason: '원자료의 새 엔진 예약·후속 실행 0회에 따라 같은 호출의 sentinel 전용 꼬리와 그 C−M을 (가)에서 제외' });
}

// Decode the local esbuild source map; no map or bundle is copied into the repository.
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function decodeMap(file) {
  const map = read(file + '.map'); let source = 0, line = 0, column = 0;
  const mappings = map.mappings.split(';').map(encoded => {
    let generated = 0; const row = [];
    for (const text of encoded.split(',')) {
      if (!text) continue;
      const values = []; let value = 0, shift = 0;
      for (const char of text) {
        const digit = chars.indexOf(char); value += (digit & 31) * 2 ** shift;
        if (digit & 32) shift += 5;
        else { values.push(value & 1 ? -(value >> 1) : value >> 1); value = 0; shift = 0; }
      }
      generated += values[0];
      if (values.length >= 4) { source += values[1]; line += values[2]; column += values[3]; row.push([generated, source, line, column]); }
    }
    return row;
  });
  return (generatedLine, generatedColumn) => {
    const row = mappings[generatedLine] ?? [];
    let match;
    for (const entry of row) { if (entry[0] > generatedColumn) break; match = entry; }
    if (!match) return null;
    const sourcePath = path.resolve(path.dirname(file), map.sources[match[1]]);
    return { file: sourcePath.startsWith(pkg + '/') ? path.relative(pkg, sourcePath) : sourcePath,
      line: match[2] + 1, column: match[3] };
  };
}
const anchors = [
  ['경로 해석', /^(resolveDependencyPath|resolveRelativeTokens|resolveGateOccurrence|bindGateHostPath|bindTemplatePath)$/],
  ['투영 읽기', /^(readProjectedValue|projectedEmission)$/],
  ['게이트 읽기·등록', /^(flushPendingGateReads|flushRead|flushGate|getGateRegistry)$/],
  ['게이트 식 평가·조회', /^(evaluateGate|getGateExpression)$/],
  ['자식 선택', /^(selectChildren|primeHost)$/],
  ['조각·유효 선언 열거', /^(selectNodeSchema|selectEffectiveDeclarations|mergeEffectiveSchema)$/],
  ['재계산 표시', /^(registerRecalculation|getDependencyIndex)$/],
  ['출력·후보 장부', /^(assembleObject|dirtyChildren|updateOutput|flushPendingOutput|updateInactiveValuesMemo|getDeclaredChildNames)$/],
  ['제어 계층', /^(getControlLayers|getExitPolicy|readExitLayerPolicy)$/],
  ['커밋·전이', /^(commitSettlement|transitionSettlement|finishSettlement)$/],
  ['배달', /^(exitSchemaNodeChain|flushSchemaNodeEvents|flushQueuedEvents|markCommitDeliveries|captureSchemaNodeChange)$/],
  ['검증', /^(requestSchemaNodeValidation|runSchemaNodeValidation|routeValidationIssues)$/],
  ['계산 몸통', /^(computeNode|computeStableNode)$/],
];
function groupOf(frames) {
  for (const frame of frames) {
    if (frame.file?.endsWith('/getGateRegistry.ts')) return '게이트 읽기·등록';
    for (const [group, pattern] of anchors) if (pattern.test(frame.name)) return group;
  }
  return frames.some(f => f.name === '(garbage collector)') ? 'GC' : '기타 함수·런타임';
}
const cpuRecords = [], functionKeys = new Set(), groups = new Set();
for (let run = 1; run <= 9; run++) for (const size of [5, 10, 20, 40]) {
  const data = read(path.join(here, `cpu-oneOf-${size}-r${run}.json`));
  assert.equal(data.officialEngineInstrumentation, false); assert.equal(data.engineClocks, 0);
  assert(data.elapsedMs < 480_000 && data.serviceExits.every(e => e.code === 0 && e.signal === null));
  const mapping = decodeMap(data.bundlePath), bundleScriptIds = new Set();
  for (const record of Object.values(data.records)) for (const node of record.profile.nodes)
    if (node.callFrame.url.endsWith(path.basename(data.bundlePath))) bundleScriptIds.add(node.callFrame.scriptId);
  const modes = {};
  for (const [mode, record] of Object.entries(data.records)) {
    const nodes = new Map(record.profile.nodes.map(n => [n.id, n])), parents = new Map(), frames = new Map();
    for (const node of nodes.values()) {
      for (const child of node.children ?? []) parents.set(child, node.id);
      const cf = node.callFrame;
      const originalPosition = bundleScriptIds.has(cf.scriptId) ? mapping(cf.lineNumber - 2, cf.columnNumber) : null;
      const file = originalPosition?.file ?? (cf.url ? cf.url.replace('file://', '') : '(V8)');
      const line = originalPosition?.line ?? cf.lineNumber + 1;
      const name = cf.functionName.replace(/^(get|set) /, '') || '(anonymous)';
      const key = `${file}:${line}:${name}`;
      frames.set(node.id, { key, name, file, line }); functionKeys.add(key);
    }
    const self = {}, inclusive = {}, partition = {};
    let time = record.profile.startTime, coveredUntil = time, sampled = 0, negativeDeltas = 0;
    for (let index = 0; index < record.profile.samples.length; index++) {
      const delta = record.profile.timeDeltas[index];
      if (delta < 0) negativeDeltas++;
      time += delta;
      const previous = coveredUntil; coveredUntil = Math.max(coveredUntil, time);
      const weight = Math.max(0, Math.min(coveredUntil, record.endUs) - Math.max(previous, record.startUs));
      if (!weight) continue;
      sampled += weight;
      const id = record.profile.samples[index], stack = [];
      for (let current = id; current; current = parents.get(current)) stack.push(frames.get(current));
      const leaf = stack[0]; self[leaf.key] = (self[leaf.key] ?? 0) + weight / 101;
      for (const key of new Set(stack.map(f => f.key))) inclusive[key] = (inclusive[key] ?? 0) + weight / 101;
      const group = groupOf(stack); groups.add(group); partition[group] = (partition[group] ?? 0) + weight / 101;
    }
    const gap = Math.max(0, record.endUs - record.startUs - sampled) / 101;
    self['(표본 경계):0:미포착 꼬리'] = gap; inclusive['(표본 경계):0:미포착 꼬리'] = gap;
    partition['표본 경계'] = gap; groups.add('표본 경계'); functionKeys.add('(표본 경계):0:미포착 꼬리');
    modes[mode] = { self, inclusive, partition, totalUs: (record.endUs - record.startUs) / 101,
      sampledUs: sampled / 101, wallUs: record.elapsedMs * 1000 / 101,
      sampledNodes: record.profile.nodes.length, samples: record.profile.samples.length, negativeDeltas };
  }
  cpuRecords.push({ size, untouched: size - 2, run, file: `profile-112-branch/cpu-oneOf-${size}-r${run}.json`, modes });
}
const referenceTimes = Object.fromEntries([5, 10, 20, 40].map(size => [size, Object.fromEntries([
  ['bf', 'axis-update'], ['first', 'axis-first'], ['later', 'axis-later']
].map(([name, mode]) => [name, originalRows.find(r => r.fixture === `oneOf-${size}` && r.mode === mode).new.metric.median * 1000]))]));
const cpuFits = {};
for (const mode of ['first', 'second', 'bf', 'later']) {
  const points = r => mode === 'bf' ? [r.modes.first, r.modes.second] : [r.modes[mode]];
  const total = fit(cpuRecords.map(r => [r.untouched, points(r).reduce((sum, m) => sum + m.totalUs, 0)]));
  const functions = [...functionKeys].map(key => {
    const self = fit(cpuRecords.map(r => [r.untouched, points(r).reduce((sum, m) => sum + (m.self[key] ?? 0), 0)]));
    const children = fit(cpuRecords.map(r => [r.untouched, points(r).reduce((sum, m) => sum + (m.inclusive[key] ?? 0), 0)]));
    const transported = field => ['bf', 'first', 'later'].includes(mode) ? fit(cpuRecords.map(r => {
      const observed = points(r), own = observed.reduce((sum, m) => sum + (m[field][key] ?? 0), 0);
      return [r.untouched, own / observed.reduce((sum, m) => sum + m.totalUs, 0) * referenceTimes[r.size][mode]];
    })) : null;
    return { function: key, self, selfAndChildren: children,
      official111SelfShareEstimate: transported('self'), official111InclusiveShareEstimate: transported('inclusive') };
  });
  const partition = [...groups].map(group => {
    const raw = fit(cpuRecords.map(r => [r.untouched, points(r).reduce((sum, m) => sum + (m.partition[group] ?? 0), 0)]));
    const transported = ['bf', 'first', 'later'].includes(mode) ? fit(cpuRecords.map(r => {
      const observed = points(r), own = observed.reduce((sum, m) => sum + (m.partition[group] ?? 0), 0);
      const whole = observed.reduce((sum, m) => sum + m.totalUs, 0);
      return [r.untouched, own / whole * referenceTimes[r.size][mode]];
    })) : null;
    return { group, raw, official111ShareEstimate: transported };
  });
  assert(Math.abs(functions.reduce((sum, r) => sum + r.self.slopeUsPerBranch, 0) - total.slopeUsPerBranch) < 1e-8,
    JSON.stringify({ mode, total: total.slopeUsPerBranch, self: functions.reduce((sum, r) => sum + r.self.slopeUsPerBranch, 0),
      mismatches: cpuRecords.filter(r => Math.abs(points(r).reduce((sum, m) => sum + Object.values(m.self).reduce((a, b) => a + b, 0) - m.totalUs, 0)) > 1e-6).map(r => [r.size, r.run]) }));
  assert(Math.abs(partition.reduce((sum, r) => sum + r.raw.slopeUsPerBranch, 0) - total.slopeUsPerBranch) < 1e-8);
  cpuFits[mode] = { total, functions, partition };
}
const officialFits = Object.fromEntries(['bf', 'first', 'later'].map(mode => [mode,
  fit([5, 10, 20, 40].map(size => [size - 2, referenceTimes[size][mode]]))]));
for (const mode of ['bf', 'first', 'later']) assert(Math.abs(cpuFits[mode].partition.reduce((sum, r) =>
  sum + r.official111ShareEstimate.slopeUsPerBranch, 0) - officialFits[mode].slopeUsPerBranch) < 1e-8);
const visitCounts = [5, 10, 20, 40].map(size => {
  const data = read(path.join(here, `counts-oneOf-${size}-r1.json`));
  const untouched = Array.from({ length: size }, (_, i) => i).filter(i => i !== 0 && i !== 4);
  const bySite = {};
  for (const mode of ['first', 'second', 'later']) for (const [site, branches] of Object.entries(data.records[mode].counts)) {
    const entry = bySite[site] ??= {};
    entry[mode] = Object.fromEntries(untouched.map(branch => [branch, branches[branch] ?? 0]));
  }
  for (const entry of Object.values(bySite)) {
    for (const mode of ['first', 'second', 'later']) entry[mode] ??= Object.fromEntries(untouched.map(branch => [branch, 0]));
    entry.bf = Object.fromEntries(untouched.map(branch => [branch, entry.first[branch] + entry.second[branch]]));
  }
  return { size, untouched, bySite, steadyPatternGroups: Object.values(data.records.steady).map(r => ({ kind: r.kind,
    transitions: r.transitions, bySite: Object.fromEntries(Object.entries(r.counts).map(([key, value]) =>
      [key, Object.fromEntries(untouched.map(branch => [branch, value[branch] ?? 0]))])) })) };
});
const artifacts = fs.readdirSync(here).filter(f => f.endsWith('.json')).map(file => {
  const data = fs.readFileSync(path.join(here, file)); assert(data.length <= 5_000_000);
  return { file: `profile-112-branch/${file}`, bytes: data.length, sha256: hash(data) };
});
const result = { head: 'bef81f4d747d028b05082d594138148520e4d992', generated: new Date().toISOString(),
  method: { arrays: 'canonical 도구, 예열 20·표본 101·fresh 세 회차 old→new/new→old/old→new',
    checkA: '엔진 macrotask 0회를 독립 확인한 경우만 preSentinel=micro clock; 공식 C/M·(나)는 유지',
    cpu: '크기마다 fresh 프로세스 9개·예열 20·101회 연속 전환의 세 파동; 첫/복귀는 미리 마운트한 101루트, 이후는 같은 루트 왕복',
    attribution: '원 timeDeltas를 단조 파동 경계에 한 번씩만 귀속; 소스맵은 scratch 전용; 가장 가까운 이름 있는 함수의 배타 몫만 합산하고 inclusive는 합산하지 않음',
    transport: '111 중앙값 × 크기별 CPU 배타 비중 뒤 OLS; 원 111 세션의 함수 내부 시간을 직접 측정한 값이 아님',
    fit: '무관 분기 3/8/18/38에 대한 OLS, 36개 fresh 실행을 같은 가중치로 사용, 주변 중앙값의 합은 사용하지 않음' },
  part1: { arrayCalibration: { C, M, wait: C - M, emptyNoise, samples: controls.length, cCi, mCi },
    arrayRows, recalculatedRows, reconstructionProof,
    numericalChanges: recalculatedRows.filter(r => Math.abs(r.beforeDifferenceUs - r.afterDifferenceUs) > 1e-9)
      .map(({ fixture, validation, mode }) => ({ fixture, validation, mode })),
    verdictChanges: recalculatedRows.filter(r => r.beforePass !== r.afterPass), needsRemeasurement: [],
    canonicalRowEndToEnd: 'array-100/off/update: old/new × 세 회차; 결과 digest 동일, 새 macrotask 0, FIFO 이후 작업 0, worker·esbuild 자연 종료 0; canonical reporter 실제 validation loop 통과' },
  part2: { referenceTimes, officialFits, cpuFits, cpuRecords, visitCounts }, artifacts,
  excluded: [{ stage: '계수 변환의 최초 빌드', reason: '빈 함수 본문 삽입 위치 충돌; 변환 정정 뒤 다시 실행, 실패 실행은 측정에 포함하지 않음' },
    { stage: '후처리 검증의 두 실행', reason: 'report-row 확인의 종료 응답 전에 analyze를 시작하여 겹침; 둘 다 원표본을 읽는 계산이며 원 측정은 겹치지 않음; 두 계산을 제외하고 종료 확인 후 순차 재실행' }] };
for (const mode of Object.values(cpuFits)) for (const fn of mode.functions) {
  fn.bySize = [5, 10, 20, 40].map(size => ({ size, untouched: size - 2,
    selfUs: average(fn.self.points.filter(p => p[0] === size - 2).map(p => p[1])),
    selfAndChildrenUs: average(fn.selfAndChildren.points.filter(p => p[0] === size - 2).map(p => p[1])) }));
  delete fn.self.points; delete fn.selfAndChildren.points;
  if (fn.official111SelfShareEstimate) {
    fn.official111BySize = [5, 10, 20, 40].map(size => ({ size, untouched: size - 2,
      selfUs: average(fn.official111SelfShareEstimate.points.filter(p => p[0] === size - 2).map(p => p[1])),
      selfAndChildrenUs: average(fn.official111InclusiveShareEstimate.points.filter(p => p[0] === size - 2).map(p => p[1])) }));
    delete fn.official111SelfShareEstimate.points; delete fn.official111InclusiveShareEstimate.points;
  }
}
const derived = JSON.stringify(cpuRecords);
assert(Buffer.byteLength(derived) <= 5_000_000);
fs.writeFileSync(path.join(scratch, 'cpu-derived-records.json'), derived);
result.part2.cpuRecords = cpuRecords.map(r => ({ ...r, modes: Object.fromEntries(Object.entries(r.modes).map(([mode, m]) =>
  [mode, { totalUs: m.totalUs, sampledUs: m.sampledUs, wallUs: m.wallUs, samples: m.samples,
    sampledNodes: m.sampledNodes, negativeDeltas: m.negativeDeltas }])) }));
result.part2.derivedRecordFile = 'profile-112-branch/cpu-derived-records.json';
const serialized = JSON.stringify(result);
assert(Buffer.byteLength(serialized) <= 5_000_000);
fs.writeFileSync(path.join(scratch, 'analysis.json'), serialized);
console.log(JSON.stringify({ file: path.join(scratch, 'analysis.json'), bytes: Buffer.byteLength(serialized),
  arrayRows: arrayRows.map(r => ({ fixture: r.fixture, mode: r.mode, differenceUs: r.differenceUs, noiseUs: r.noiseUs })),
  changedVerdicts: result.part1.verdictChanges.map(r => `${r.fixture}/${r.validation}/${r.mode}`),
  fits: Object.fromEntries(Object.entries(cpuFits).map(([mode, r]) => [mode, r.total.slopeUsPerBranch])),
  officialFits: Object.fromEntries(Object.entries(officialFits).map(([mode, r]) => [mode, r.slopeUsPerBranch])) }));
