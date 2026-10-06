// CLI report compiler; reads measurement artifacts and emits one requested artifact to stdout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const d = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(d, '../../../../../..');
const expected = '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07';
assert.equal(fs.realpathSync(repo), expected);
const require = createRequire(path.join(repo, 'package.json'));
const ts = require('typescript');
const { TraceMap, originalPositionFor } = require('@jridgewell/trace-mapping');
const read = name => JSON.parse(fs.readFileSync(path.join(d, name), 'utf8'));
const key = f => `${f.function}|${f.file}:${f.line}`;
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const span = values => [Math.min(...values), Math.max(...values)];
const configs = read('profile-99c01/profile-99c01-ablations.json');
const files = fs.readdirSync(path.join(d, 'profile-99c01'));
const profiles = files.filter(f => /^profile-99c01-(head|old)-.*\.json$/.test(f)).map(f => {
  const p = read(path.join('profile-99c01', f));
  const selected = new Set([...p.functions.slice(0, 25), ...[...p.functions].sort((a, b) => b.totalUs - a.totalUs).slice(0, 25)].map(key));
  return { ...p, artifact: f, top25AndAtLeast2Percent: p.functions.filter(x => selected.has(key(x)) || x.selfPercent >= 2 || x.totalPercent >= 2) };
}).sort((a, b) => `${a.mode}/${a.name}/${a.variant}`.localeCompare(`${b.mode}/${b.name}/${b.variant}`));
const head = profiles[0].head;
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim(), head);
const getRuns = (id, o) => [1, 2, 3].map(r => read(`profile-99c01/profile-99c01-paired-${id}-${o.name}-${o.mode}-r${r}.json`));
const observe = x => ({ sha256: x.sha256, outputBytes: x.outputBytes, liveWidth: x.liveWidth, kind: x.value?.kind });

/** Exact distribution-free median interval for independent continuous paired observations. */
function medianInterval(values) {
  const a = [...values].sort((x, y) => x - y), n = a.length;
  let probability = 2 ** -n, cumulative = 0, k = 0;
  for (let i = 0; i <= Math.floor(n / 2); i++) {
    cumulative += probability;
    if (cumulative <= 0.025) k = i;
    else break;
    probability *= (n - i) / (i + 1);
  }
  return [a[k], a[n - 1 - k]];
}

const control = configs.find(c => c.id === 'control').operations.map(o => {
  const runs = getRuns('control', o);
  const noiseMs = Math.max(...runs.flatMap(r => [Math.abs(r.boundMs), Math.abs(r.pairedDelta.median)]));
  return { ...o, noiseMs, boundsMs: runs.map(r => r.boundMs), pairedMediansMs: runs.map(r => r.pairedDelta.median) };
});
const structuralGroups = {
  'total-write': 'S06', 'api-write': 'S06', 'total-mount': 'S06', 'root-build': 'S02', 'factory-reuse': 'S02', 'blueprint': 'S01',
  'static-load': 'S02', 'mount-load': 'S02', 'compute': 'S03', 'finish': 'S03',
  'transition': 'S03', 'gates': 'S03', 'prime-host': 'S03', 'commit': 'S03', 'output': 'S03', 'mark-write': 'S03', 'exits': 'S04',
  'derive-rounds': 'S03', 'derive-evaluation': 'S03', 'derive-commit': 'S03', 'scratch': 'S05',
};
const ledgerGroups = {
  S01: { id: 'PROFILE-99C01-S01', references: ['BLUEPRINT-001', 'BLUEPRINT-021', 'BLUEPRINT-022', 'GOAL-070'], spec: '콜드 청사진의 불변 분석과 폼별 가변 캐시를 분리할 공유 계약을 원장에 명시합니다. 스키마 객체의 내용·옵션·표현식 컨텍스트·변경 가능성·캐시 수명과 무효화 및 서로 다른 폼의 독립성을 정의해야 합니다. 완성 청사진 상수 공유를 제품에 그대로 적용하지 않습니다.' },
  S02: { id: 'PROFILE-99C01-S02', references: ['GOAL-071', 'NODE-039', 'BLUEPRINT-010', 'GOAL-069'], spec: '모든 초기 살아 있는 노드의 즉시 생성, 인스턴스 identity, 동기 find/명령, 초기 생명주기와 비용을 함께 다루는 구조 항목입니다. 노드 트리 상수 재사용·초기 로드 생략은 이 계약을 포기한 천장입니다. 공유 청사진만의 상한과 노드/런타임 재사용 상한을 혼동하지 않습니다.' },
  S03: { id: 'PROFILE-99C01-S03', references: ['SETTLE-003', 'SETTLE-017', 'SETTLE-044', 'SETTLE-050', 'WRITE-090'], spec: '고정 출발점·청사진 전순서·게이트 즉시 공표·파생 및 전이 쓰기·최소 고정점·예산과 Source B를 보존하는 구조 개선만 별도 원장 항목으로 검토합니다. 직전 활성 집합이나 fixture 상수 결과로 계산을 생략하는 변경은 허용하지 않습니다.' },
  S04: { id: 'PROFILE-99C01-S04', references: ['WRITE-032', 'WRITE-033', 'WRITE-034', 'WRITE-037', 'VALUE-031'], spec: '나감·잠복 하위 트리·비움 정책을 제거한 천장입니다. 정책·원본 보존·공유 종류·잠복 identity를 바꿀 경우 원장 결정이 필요합니다. 정책을 보존하는 메모 증분 갱신은 inactive-memo의 코드 수준 항목으로 분리합니다.' },
  S05: { id: 'PROFILE-99C01-S05', references: ['SETTLE-001', 'SETTLE-038', 'EVENT-008', 'EVENT-013'], spec: '정착 scratch와 런타임 소유권의 수명, 같은 폼 재진입, batch 및 서로 다른 폼의 동시성을 명시할 구조 항목입니다. 전역 상수 scratch 재사용은 독립성을 잃는 천장입니다.' },
  S06: { id: 'PROFILE-99C01-S06', references: ['GOAL-011', 'GOAL-071', 'EVENT-002'], spec: '전체 연산을 무동작 또는 상수 트리로 만든 계측 천장입니다. 구현 후보가 아니며 전체 남은 비용과 잡음의 크기를 검산하는 데만 사용합니다.' },
};
const codeReferences = id => {
  if (/schema|control-layers/.test(id)) return ['BLUEPRINT-021', 'NODE-006', 'SETTLE-017'];
  if (/event|deliver|revision|commit/.test(id)) return ['EVENT-005', 'EVENT-007', 'EVENT-024', 'SETTLE-006'];
  if (/assemble|output|same-value/.test(id)) return ['SETTLE-043', 'VALUE-028', 'VALUE-013'];
  if (/inactive|latent/.test(id)) return ['WRITE-087', 'WRITE-094', 'VALUE-031'];
  return ['GOAL-011', 'BLUEPRINT-022', 'SETTLE-017', 'SETTLE-044', 'SETTLE-050'];
};
const bounds = configs.flatMap(c => c.operations.map(o => {
  const runs = getRuns(c.id, o);
  const noiseMs = control.find(x => x.name === o.name && x.mode === o.mode).noiseMs;
  const deltas = runs.map(x => x.boundMs), intervals = runs.map(x => medianInterval(x.pairedDeltasMs));
  const changed = runs.map(x => x.observations.head.sha256 !== x.observations[c.id].sha256);
  const zeroMount = c.id === 'gate-evaluation-zero' && o.mode === 'mount';
  const classification = zeroMount ? 'structural' : c.classification;
  const aboveNoise = c.id !== 'control' && Math.min(...deltas) > noiseMs && Math.min(...intervals.map(x => x[0])) > 0;
  const group = zeroMount ? 'S03' : structuralGroups[c.id];
  return { id: c.id, ...o, classification, medianBoundMs: median(deltas), spreadMs: span(deltas),
    noiseMs, aboveNoise, positiveAllRuns: deltas.every(x => x > 0),
    headMedianMs: median(runs.map(x => x.metrics.head.median)), variantMedianMs: median(runs.map(x => x.metrics[c.id].median)),
    boundPercent: 100 * median(deltas) / median(runs.map(x => x.metrics.head.median)),
    spec: zeroMount ? '마운트에서 최종 기본 kind의 Boolean을 초기 바퀴부터 고정하여 바퀴 경로가 달라집니다. 최종 출력 동치만으로 순수 식 평가 비용이라 할 수 없으므로 구조적 상한으로 기록합니다.' : c.spec,
    ledger: classification === 'structural' ? ledgerGroups[group] : { references: codeReferences(c.id) },
    runs: runs.map((r, i) => ({ run: r.run, warmup: r.warmup, samples: r.samples, started: r.started, ended: r.ended,
      head: r.metrics.head, variant: r.metrics[c.id], boundMs: r.boundMs, pairedDelta: r.pairedDelta,
      pairedMedianIntervalMs: intervals[i], emptyBefore: r.emptyBefore, emptyAfter: r.emptyAfter,
      subtractedEmptyMs: r.subtractedEmptyMs, observations: { head: observe(r.observations.head), variant: observe(r.observations[c.id]) },
      resultChanged: changed[i], artifact: `profile-99c01-paired-${c.id}-${o.name}-${o.mode}-r${r.run}.json` })) };
}));
const comparisons = ['sample-0', 'nested-d5-f4', 'computed-visible-derived', 'array-100'].map(name => ({ name, mode: 'later' }))
  .concat(['flat-500', 'nested-d5-f4', 'oneOf-20'].map(name => ({ name, mode: 'mount' })))
  .map(o => { const runs = getRuns('old', o); return { ...o, headMedianMs: median(runs.map(x => x.metrics.head.median)),
    oldMedianMs: median(runs.map(x => x.metrics.old.median)), ratioMedian: median(runs.map(x => x.metrics.head.median / x.metrics.old.median)),
    ratioSpread: span(runs.map(x => x.metrics.head.median / x.metrics.old.median)),
    runs: runs.map(x => ({ run: x.run, head: x.metrics.head, old: x.metrics.old,
      differenceMs: x.boundMs, ratio: x.metrics.head.median / x.metrics.old.median,
      subtractedEmptyMs: x.subtractedEmptyMs, observations: { head: observe(x.observations.head), old: observe(x.observations.old) },
      artifact: `profile-99c01-paired-old-${o.name}-${o.mode}-r${x.run}.json` })) }; });

const growth = ['later', 'first'].map(mode => {
  const a = profiles.find(p => p.variant === 'head' && p.name === 'oneOf-5' && p.mode === mode);
  const b = profiles.find(p => p.variant === 'head' && p.name === 'oneOf-40' && p.mode === mode);
  const small = new Map(a.functions.map(f => [key(f), f]));
  const rows = b.functions.filter(f => f.file.startsWith('packages/canard/schema-form/src/') || f.file.startsWith('packages/winglet/')).flatMap(f => {
    const s = small.get(key(f)); if (!s) return [];
    const deltaSelf = f.selfUsPerOperation - s.selfUsPerOperation;
    const deltaTotal = f.totalUsPerOperation - s.totalUsPerOperation;
    const error = (x, count) => count ? x / Math.sqrt(count) : 0;
    const selfMargin = 1.96 * Math.hypot(error(f.selfUsPerOperation, f.selfSamples), error(s.selfUsPerOperation, s.selfSamples));
    const totalMargin = 1.96 * Math.hypot(error(f.totalUsPerOperation, f.totalSamples), error(s.totalUsPerOperation, s.totalSamples));
    return [{ function: f.function, file: f.file, line: f.line, five: s, forty: f,
      deltaSelfUsPerOperation: deltaSelf, deltaTotalUsPerOperation: deltaTotal, selfMarginUs: selfMargin, totalMarginUs: totalMargin,
      growsSelf: deltaSelf >= 1 && deltaSelf > selfMargin && Math.min(s.selfSamples, f.selfSamples) >= 20,
      growsTotal: deltaTotal >= 1 && deltaTotal > totalMargin && Math.min(s.totalSamples, f.totalSamples) >= 20 }];
  }).sort((x, y) => y.deltaSelfUsPerOperation - x.deltaSelfUsPerOperation);
  return { mode, operations: { five: a.operations, forty: b.operations }, evidence: { five: observe(a.evidence), forty: observe(b.evidence) },
    rows: rows.filter(r => r.growsSelf || r.growsTotal) };
});

/** Resolve edit body extents so anonymous callbacks can be assigned to the measured job. */
const editRanges = configs.flatMap(c => c.edits.flatMap(e => {
  if (e.replace) return [];
  const source = ts.createSourceFile(e.file, fs.readFileSync(path.join(repo, e.file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const ranges = [];
  function visit(n) {
    const className = n.parent && ts.isClassDeclaration(n.parent) ? n.parent.name?.text : undefined;
    const name = ts.isConstructorDeclaration(n) ? 'constructor' : n.name?.getText(source);
    let body;
    if (name === e.name && (!e.class || className === e.class)) {
      if (ts.isVariableDeclaration(n)) body = n.initializer?.body;
      else body = n.body;
    }
    if (body) ranges.push({ id: c.id, file: e.file, function: e.name,
      start: source.getLineAndCharacterOfPosition(n.getStart(source)).line + 1,
      end: source.getLineAndCharacterOfPosition(body.end).line + 1 });
    ts.forEachChild(n, visit);
  }
  visit(source);
  assert(ranges.length === 1, `Edit range ${c.id}/${e.file}/${e.name}: ${ranges.length}`);
  return ranges;
}));

const coverage = profiles.filter(p => p.variant === 'head').map(p => {
  const growing = growth.find(x => x.mode === p.mode)?.rows ?? [];
  const candidates = p.functions.filter(f => (f.file.startsWith('packages/canard/schema-form/src/') || f.file.startsWith('packages/winglet/')) &&
    (f.totalPercent >= 5 || (p.name === 'oneOf-40' && growing.some(g => key(g) === key(f)))));
  const raw = JSON.parse(fs.readFileSync(p.rawProfile, 'utf8'));
  const sourceMap = new TraceMap(JSON.parse(fs.readFileSync(path.join(d, '.profile-99c01-work/head.cjs.map'), 'utf8')));
  const nodes = new Map(raw.nodes.map(n => [n.id, n])), parents = new Map();
  for (const n of raw.nodes) for (const child of n.children ?? []) parents.set(child, n.id);
  const frames = new Map(raw.nodes.map(n => {
    const f = n.callFrame; let file = f.url || '(V8)', line = f.lineNumber + 1;
    if (file.endsWith('head.cjs')) {
      const original = originalPositionFor(sourceMap, { line: Math.max(1, line), column: Math.max(0, f.columnNumber) });
      if (original.source) { file = path.relative(repo, path.resolve(d, '.profile-99c01-work', original.source)); line = original.line; }
    } else if (file.startsWith('file://')) file = path.relative(repo, fileURLToPath(file));
    else if (file.startsWith(repo)) file = path.relative(repo, file);
    return [n.id, { function: f.functionName || '(anonymous)', file, line }];
  }));
  const relevant = editRanges.filter(e => configs.find(c => c.id === e.id).operations.some(o => o.name === p.name && o.mode === p.mode));
  const jobForFrame = new Map([...frames].map(([id, f]) => [id, relevant.filter(e => e.file === f.file && f.line >= e.start && f.line <= e.end).map(e => e.id)]));
  const stacks = new Map([...nodes.keys()].map(id => { const stack = []; let cursor = id;
    while (cursor !== undefined) { stack.push(cursor); cursor = parents.get(cursor); } return [id, stack]; }));
  const targets = new Set(candidates.map(key)), overlaps = new Map();
  let timestamp = raw.startTime;
  for (let i = 0; i < raw.samples.length; i++) {
    const delta = raw.timeDeltas[i]; timestamp += delta;
    if (timestamp < p.beginUs || timestamp > p.endUs) continue;
    const stack = stacks.get(raw.samples[i]);
    if (p.mode === 'first' && !stack.some(id => nodes.get(id).callFrame.functionName === 'profileFirstUpdate')) continue;
    if (nodes.get(raw.samples[i]).callFrame.functionName === '(idle)') continue;
    const seen = new Set();
    for (let j = 0; j < stack.length; j++) {
      const fkey = key(frames.get(stack[j])); if (!targets.has(fkey) || seen.has(fkey)) continue;
      seen.add(fkey);
      const jobs = new Set(stack.slice(j).flatMap(id => jobForFrame.get(id)));
      if (jobs.size) overlaps.set(fkey + '|ANY', (overlaps.get(fkey + '|ANY') ?? 0) + delta);
      for (const job of jobs) { const id = fkey + '|' + job; overlaps.set(id, (overlaps.get(id) ?? 0) + delta); }
    }
  }
  return { name: p.name, mode: p.mode, candidates: candidates.map(f => {
    const jobs = relevant.map(e => e.id).filter((v, i, a) => a.indexOf(v) === i).flatMap(id => {
      const us = overlaps.get(key(f) + '|' + id) ?? 0; if (!us) return [];
      return [{ id, coveredInclusivePercent: 100 * us / f.totalUs,
        direct: relevant.some(e => e.id === id && e.file === f.file && f.line >= e.start && f.line <= e.end) }];
    }).sort((a, b) => Number(b.direct) - Number(a.direct) || b.coveredInclusivePercent - a.coveredInclusivePercent);
    const combinedCoveragePercent = 100 * (overlaps.get(key(f) + '|ANY') ?? 0) / f.totalUs;
    return { function: f.function, file: f.file, line: f.line, selfPercent: f.selfPercent, totalPercent: f.totalPercent, combinedCoveragePercent,
      threshold: f.totalPercent >= 5 ? 'inclusive>=5%' : 'branch-growth', jobs,
      covered: combinedCoveragePercent >= 99.5 };
  }) };
});
const uncovered = coverage.flatMap(p => p.candidates.filter(c => !c.covered).map(c => ({ name: p.name, mode: p.mode, ...c })));
const builds = fs.readdirSync(path.join(d, '.profile-99c01-work')).filter(f => f.endsWith('.cjs')).map(file => {
  const bytes = fs.readFileSync(path.join(d, '.profile-99c01-work', file)); return { variant: file.slice(0, -4), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
});
const dependencyArtifacts = [...new Set(profiles.flatMap(p => p.functions.filter(f => f.file.startsWith('packages/winglet/')).map(f => f.file)))].map(file => {
  const bytes = fs.readFileSync(path.join(repo, file));
  return { file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
});
const summary = { format: 'profile-99c01/v1', head, dependencyArtifacts, editorDecision: { id: '99C-01', ref: 'origin/1.0.0-beta', commit: '0e934e488', path: 'packages/canard/schema-form/architecture/reviews/round-99-closing.md' },
  environment: profiles.find(p => p.variant === 'head').environment,
  method: { profiler: 'V8 --cpu-prof --cpu-prof-interval=100', production: true, spans: false, warmup: 20, pairedSamples: 101,
    freshProcessesPerComparison: 3, execution: 'sequential; natural subprocess exits; no installs, git writes, source changes or agents',
    denominator: 'actual non-idle timeDeltas within workload window; first profiles only profileFirstUpdate descendants; later/mount include driver frames',
    merge: 'function + source file:line; recursive inclusive frames counted once per sample',
    paired: 'alternating HEAD/variant; GC/schema preparation outside timer; operation + 64 Promise turns + setImmediate sentinel; subtract empty baseline',
    bound: 'median(HEAD)-median(ablated), independently in each fresh process; report median and min/max across 3',
    noise: 'max absolute same-bundle control bounds and paired medians across 3; aboveNoise requires all 3 bounds > noise and all paired median interval lower ends > 0',
    pairedIntervals: 'distribution-free median intervals; serial samples are not guaranteed independent, so descriptive evidence only',
    growth: 'absolute sampled us/op; >=1us increase beyond approximate Poisson sample margin and >=20 samples on both profiles; sampling inference, no end-to-end verdict',
    hotVsCold: 'long hot profiles and warmup20/101 forced-GC paired runs have different JIT/GC regimes; CPU us/op is not paired wall latency',
    limits: ['ablation results may be wrong; transitive work and live width can change', 'bounds overlap and cannot be summed', 'guard and replacement lookup overhead remains in variants', 'GC and driver frames remain visible in profile tables; no GC share is assigned to one function without an allocation ablation'],
    rawDirectory: path.dirname(profiles[0].rawProfile), maxArtifactBytes: 5000000 },
  counts: { profiles: profiles.length, variantsIncludingControl: configs.length, ablationComparisonsIncludingControl: bounds.length, pairedFreshProcesses: bounds.length * 3 + comparisons.length * 3,
    aboveNoise: bounds.filter(x => x.aboveNoise).length, sourceCandidateRows: coverage.reduce((n, x) => n + x.candidates.length, 0), uncoveredRows: uncovered.length },
  builds, profiles: profiles.map(({ functions, ...p }) => p), branchCountComparison: growth, comparisons, control, bounds, ablationConfigurations: configs, ledgerGroups, coverage, uncovered };

const f = (x, digits = 3) => Number.isFinite(x) ? x.toFixed(digits) : '—';
const op = x => `${x.name}/${x.mode}`;
const short = file => file.replace('packages/canard/schema-form/', 'PKG/').replace('packages/aileron/benchmark-form/', 'BF/');
const rows = bounds.filter(x => x.aboveNoise && x.classification !== 'control');
const lines = [
  '# 99C-01 — 무계측 CPU 귀속과 제거 상한', '',
  `기준 HEAD는 \`${head}\`입니다. 99C-01의 “span 시간은 호출수로만 사용하고 sampling으로 다시 귀속하며 제거 빌드의 종단 상한을 먼저 확인한다”는 결정을 적용했습니다. 제품 구현, 설치, git 쓰기, 커밋 및 다른 에이전트 실행은 하지 않았습니다.`, '',
  '## 판정에 필요한 결론', '',
  '분기 수가 늘 때 커지는 것은 조건 비교식 자체보다 경로 해석·투영 읽기·게이트 등록·선언 선택·재계산 표시입니다. 정적 리터럴 비교 및 미리 계산한 Boolean 조회는 첫/후속 갱신에서 잡음을 넘는 개선을 보이지 않았습니다. 전체 gate 제거의 이득을 비교식 비용으로 다시 귀속하지 않습니다.', '',
  `요청된 ${profiles.length}개 프로파일과 ${bounds.length}개 연산별 대조(${configs.length}개 변형, 동일 번들 control 포함), 구 엔진 비교 7개를 수집했습니다. paired worker는 총 ${summary.counts.pairedFreshProcesses}개이며 각 worker는 warmup 20, 101개 표본을 사용하고 스스로 종료했습니다. 잡음 초과 판정은 ${summary.counts.aboveNoise}행입니다.`, '',
  '코드 수준 우선 후보는 경로의 정적 바인딩, 투영 읽기 재사용, 변경 경로 표시의 중복 제거, 단일 무조건 유효 스키마의 준비, 올바른 초기 revision 스냅샷 공유, 소비자 없는 payload 지연, 첫 조립의 안정 형상 메모입니다. 완성 청사진·노드 트리·scratch 상수 재사용, 고정점·전이·나감 생략은 구조 항목입니다. 어느 상한도 구현 후 보장되는 속도 향상이나 서로 더할 수 있는 단계별 비율이 아닙니다.', '',
  '## 방법과 환경', '',
  'PKG의 engine 코드는 HEAD 소스에서 빌드했고 외부 workspace utility는 이미 존재하는 production dist를 양쪽에서 동일하게 사용했습니다. 표본에 나타난 외부 runtime 파일의 SHA-256을 JSON의 dependencyArtifacts에 보존했습니다.', '',
  `- Apple M1 Max, ${summary.environment.cpus} logical CPU, ${(summary.environment.memoryBytes / 2 ** 30).toFixed(0)} GiB, darwin arm64 ${summary.environment.osRelease}; Node ${summary.environment.node}, V8 ${summary.environment.v8}, esbuild ${summary.environment.esbuild}. NODE_ENV=production, validation off, subscribers=0, root onChange=noop.`,
  '- 새 엔진과 0.16.0(__legacy__) 모두 HEAD 소스에서 core 전용 production 번들을 만들었습니다. React·브라우저·검증기 비용은 이 작업의 표본에 포함하지 않았습니다. 인스트루먼트 span은 하나도 넣지 않았으며 함수 안에 타이머를 삽입하지 않았습니다. 함수명을 보존한 source map으로 파일:줄을 복원했습니다.',
  '- CPU interval 요청값은 100 µs입니다. 요청값을 샘플 수에 곱하지 않고 V8 timeDeltas의 실제 간격을 가중치로 사용했습니다. 로딩/warmup 밖의 작업 구간만 선택했고 (idle)은 제외했습니다. first는 profileFirstUpdate 호출의 자손 표본만 남겨 새 마운트 표본을 분리했습니다. first의 바깥 연산 시계는 V8 내부 함수의 인라이닝을 막지 않습니다.',
  '- later는 한 mounted form의 동일 전이를 반복합니다. 새 엔진은 128회마다 driver를 drain하고 구 엔진은 매회 drain하여 비동기 변경을 다음 연산으로 넘기지 않습니다. first는 매번 새 cold mount 뒤 첫 작성된 갱신이며 누적 동기 작업 3.5초(아주 짧은 sample-0은 5초)를 목표로 했습니다. later/mount의 driver, schema clone, GC, V8 내장 프레임은 표에 유지됩니다. 그 비율은 종단 phase 비율이 아닙니다.',
  '- hot loop 프로파일과 warmup20/101 fresh-process 종단 측정의 JIT 및 GC 조건이 다릅니다. 프로파일의 sampled µs/op를 후자의 벽시계 시간 대신 쓰지 않습니다. 실제 표본 수와 작업/선택 시간을 각 표 앞에 적었습니다.',
  '- 제거는 파일을 쓰지 않는 in-memory build plugin으로만 수행했습니다. 각 named body의 일치 수를 1로 검증하고 guard는 타이머 밖 준비/마운트를 원래 동작으로 유지합니다. 잘못된 결과는 허용되며 최종 출력 hash/크기/폭을 모든 paired JSON에 기록했습니다. guard·상수 조회 자체의 비용은 제거 빌드에 남습니다.',
  '- 종단 timer는 연산 전에서 시작해 64개의 Promise turn과 같은 check queue의 setImmediate sentinel을 통과할 때 끝납니다(95C-01 방식). 양쪽은 같은 세션에서 순서를 교대합니다. schema clone·fresh mount 준비·강제 GC는 timer 밖이며 empty sentinel 101개를 앞뒤로 재서 두 median의 평균을 양쪽에서 뺐습니다. 음수는 0으로 자르지 않았습니다.',
  '- 잡음 N은 동일 HEAD 번들을 다른 모듈로 로드한 control의 3회 median 차이와 paired median 절댓값의 최댓값입니다. 모든 run의 HEAD−ablated가 N보다 크고 각 run의 paired median 구간 하한이 0보다 클 때만 “초과”입니다. 연속 표본의 독립성은 보장되지 않으므로 구간은 보조 관찰이며 run 재현성과 control이 판정의 핵심입니다.',
  '- 유효 스키마 상수는 BlueprintNode별 안정 객체를 사용했습니다. 매회 새 객체를 돌려주어 호스트 바퀴가 예산을 초과했던 실패 변형과 PathPrefix 반환형을 잘못 쓴 실패는 자연 종료 후 수정했고 성공 측정만 저장했습니다. 실패 시간은 채택하지 않았습니다.', '',
  '재현 명령(모두 stage-07에서, 순차 실행):', '', '```sh',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --build head old',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --profiles',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --profiles head sample-0 first 5000',
  'node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --matrix',
  '# 구 엔진 보강: --profiles old array-100 later 50000, nested-d5-f4 later 30000, sample-0 later 55000, computed-visible-derived later 50000.',
  '# 구 엔진 종단 비교: 표의 각 fixture/mode로 --paired old <fixture> later|mount를 실행합니다.',
  '```', '',
  '## 종단 비교 — 새 엔진과 0.16.0', '',
  '| 연산 | HEAD median ms | 0.16.0 median ms | 비율 median | 3회 비율 범위 |',
  '| --- | ---: | ---: | ---: | --- |',
  ...comparisons.map(x => `| ${op(x)} | ${f(x.headMedianMs, 6)} | ${f(x.oldMedianMs, 6)} | ${f(x.ratioMedian)}× | ${x.ratioSpread.map(v => f(v)).join('–')}× |`), '',
  '원 엔진의 의미·이벤트 계약이 새 원장과 완전히 같다는 주장이 아니라, BF가 정의한 같은 작성자 연산에 대한 기준선입니다. computed-visible-derived는 의존 갱신 뒤 trigger on 상태, array-100은 첫 아이템 내부 갱신입니다. 같은 값을 반복하는 빠른 반환을 쓰지 않았습니다.', '',
  '## 분기 축 — oneOf 5 → 40', '',
  'oneOf fixture는 분기 조각 수만 증가하고 선택된 kind_0↔kind_4 전이, 살아 있는 자식 폭과 입력/출력 크기는 고정입니다. 증가 판단은 각 프로파일의 비율만 비교하지 않고 실제 sampled µs/op를 비교합니다. 1 µs 이상 차이, 양쪽 20개 이상 표본, 근사 표본 오차보다 큰 차이를 증가 후보로 표시했습니다. 이는 sampling 추론이며 구현 판정은 아래 제거 상한으로 합니다.', '',
];
for (const g of growth) {
  lines.push(`### ${g.mode}`, '', `최종 관찰: 5=${JSON.stringify(g.evidence.five)}, 40=${JSON.stringify(g.evidence.forty)}.`, '',
    '| 함수 / 원본 | self µs/op 5→40 | total µs/op 5→40 | self 표본 5/40 | total 표본 5/40 | 증가 |', '| --- | ---: | ---: | ---: | ---: | --- |',
    ...g.rows.map(r => `| ${r.function} · ${short(r.file)}:${r.line} | ${f(r.five.selfUsPerOperation)}→${f(r.forty.selfUsPerOperation)} | ${f(r.five.totalUsPerOperation)}→${f(r.forty.totalUsPerOperation)} | ${r.five.selfSamples}/${r.forty.selfSamples} | ${r.five.totalSamples}/${r.forty.totalSamples} | ${[r.growsSelf ? 'self' : '', r.growsTotal ? 'total' : ''].filter(Boolean).join('+')} |`), '');
}
lines.push('## 연산별 프로파일', '', '각 표는 self 상위 25와 total 상위 25의 합집합 및 self 또는 total이 2% 이상인 모든 함수를 포함합니다. self는 잎의 시간, total은 자손 포함 시간입니다. 재귀로 같은 function/file:line이 여러 번 등장해도 한 sample의 inclusive 시간은 한 번만 셉니다. 행끼리 total을 더하지 않습니다.', '');
for (const p of profiles) {
  lines.push(`### ${p.variant} · ${op(p)}`, '', `연산 ${p.operations.toLocaleString('en-US')}회; 작업 벽시계 ${f(p.elapsedMs)} ms; 첫 갱신 누적 동기 작업 ${f(p.synchronousMs)} ms; 선택된 비유휴 표본 ${p.selectedSamples.toLocaleString('en-US')}개 / ${f(p.selectedMs)} ms; 요청 interval ${p.intervalUs} µs. 개별 요약: [${p.artifact}](${p.artifact}).`, '',
    '| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |', '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...p.top25AndAtLeast2Percent.map(r => `| ${r.function} · ${short(r.file)}:${r.line} | ${f(r.selfPercent, 2)} | ${f(r.totalPercent, 2)} | ${f(r.selfMs)} | ${f(r.totalMs)} | ${r.selfSamples} | ${r.totalSamples} |`), '');
}
lines.push('## 제거 상한과 잡음', '', '단위는 ms입니다. Δ=각 fresh process의 median(HEAD)−median(제거); 대표값은 세 Δ의 median입니다. 범위는 세 run의 최솟값–최댓값입니다. “결과 변경”은 마지막 표본의 output hash가 달라진 run 수이며, 0/3도 모든 중간 동작의 동치 증명은 아닙니다.', '',
  '| 연산 | 동일 번들 잡음 N ms | control Δ 3회 |', '| --- | ---: | --- |',
  ...control.map(x => `| ${op(x)} | ${f(x.noiseMs, 6)} | ${x.boundsMs.map(v => f(v, 6)).join(', ')} |`), '',
  '| 제거 job | 연산 | HEAD / 제거 ms | Δ median ms | 3회 Δ 범위 ms | N ms | 판정 | 분류 | 결과 변경 |', '| --- | --- | ---: | ---: | --- | ---: | --- | --- | --- |',
  ...bounds.filter(x => x.id !== 'control').map(x => `| ${x.id} | ${op(x)} | ${f(x.headMedianMs, 6)} / ${f(x.variantMedianMs, 6)} | ${f(x.medianBoundMs, 6)} | ${x.spreadMs.map(v => f(v, 6)).join('–')} | ${f(x.noiseMs, 6)} | ${x.aboveNoise ? '초과' : '불명확'} | ${x.classification === 'code-level' ? '코드' : '구조'} | ${x.runs.filter(r => r.resultChanged).length}/3 |`), '',
  'gate-condition은 비교식을 정적 리터럴 비교로 바꾼 변형이고 gate-evaluation-zero는 타이머 밖에서 계산한 Boolean을 조회하는 변형입니다. first/later는 관찰된 최종 출력이 같고 잡음 초과 이득이 없습니다. latter의 mount 이득은 기본 kind의 최종 결과를 초기 바퀴부터 고정해 경로가 달라진 상한이므로 구조로 분류했습니다. gates의 전체 제거와 gate-expression의 잘못된 상수 표현식도 순수 비교식 비용으로 해석하지 않습니다.', '',
  '## 코드 수준 수정 사양', '',
  '아래는 큰 상한을 원장 안에서 실제 동작을 유지하며 다룰 수정 사양입니다. 상수/skip 빌드 자체를 구현하지 않습니다. 최종 입력/출력, 중간 공표 순서, late subscription, 배열·wrong-kind·throw·Source B 및 재진입 차등 검증 뒤 95C-01 종단 재측정이 통과해야 합니다. 제거 상한이 큰 항목도 같은 크기의 구현 이득을 약속하지 않습니다.', '',
  '| job | 잡음 초과 연산 수 | 최대 대표 상한 ms / 연산 | 사양 | 원장 |', '| --- | ---: | --- | --- | --- |',
  ...configs.filter(c => c.classification === 'code-level').map(c => {
    const xs = rows.filter(x => x.id === c.id && x.classification === 'code-level').sort((a, b) => b.medianBoundMs - a.medianBoundMs);
    return `| ${c.id} | ${xs.length} | ${xs.length ? `${f(xs[0].medianBoundMs, 6)} / ${op(xs[0])}` : '잡음 초과 없음'} | ${c.spec} | ${codeReferences(c.id).join(', ')} |`;
  }), '',
  'schema-merge는 기존 단일 무조건 경로에서 매 cold 분석의 재병합을 없애는 사양이고, blueprint는 이미 완성된 전체 분석을 공유하는 별도 구조 상한입니다. static-commit은 올바른 revision 및 통지를 유지한 초기 경로 최적화이고 revision은 그 중 복사/할당만의 상한입니다. children/recalculation/gate-expression의 큰 값에는 dirty 제거 또는 잘못된 gate 결과로 사라지는 하위 작업도 포함됩니다. 작은 Map 조회 하나를 바꾸면 이 값 전체가 회복된다고 해석할 수 없습니다.', '',
  '## 구조적 원장 항목', '', '아래 ID는 이 보고서의 제안 꼬리표이며 실제 ledger 파일은 수정하지 않았습니다.', '',
  '| 제안 ID | 해당 제거 job | 검토할 계약 | 기존 원장 |', '| --- | --- | --- | --- |',
  ...Object.entries(ledgerGroups).map(([id, g]) => `| ${g.id} | ${Object.entries(structuralGroups).filter(([, value]) => value === id).map(([job]) => job).join(', ')}${id === 'S03' ? ', gate-evaluation-zero/mount' : ''} | ${g.spec} | ${g.references.join(', ')} |`), '',
  '## 큰 share / 증가 함수의 제거 대조 coverage', '',
  '자손의 inclusive share는 중첩된 job의 상한에 묶습니다. 아래 연결은 실제 CPU call tree에서 그 함수를 덮는 직접 또는 부모 job이며, “coverage”는 해당 함수 inclusive 시간 중 그 job 프레임이 조상에 있는 비율입니다. 여러 호출 문맥에 걸친 함수는 job들의 표본 합집합을 쓰며 제거 상한의 합은 쓰지 않습니다. 전체-write 천장만 있는 행은 그 사실을 그대로 적습니다. JSON에는 모든 연결과 비율을 보존했습니다.', '',
  '| 연산 | 함수 / 원본 | self/total % | 근거 | 직접 또는 부모 job | coverage % |', '| --- | --- | ---: | --- | --- | ---: |',
  ...coverage.flatMap(p => p.candidates.map(c => { const chosen = c.jobs.find(x => x.direct && x.coveredInclusivePercent >= 99.5) ?? c.jobs.find(x => x.coveredInclusivePercent >= 99.5) ?? { id: c.jobs.map(x => x.id).join('+'), coveredInclusivePercent: c.combinedCoveragePercent, direct: false };
    return `| ${op(p)} | ${c.function} · ${short(c.file)}:${c.line} | ${f(c.selfPercent, 2)}/${f(c.totalPercent, 2)} | ${c.threshold} | ${chosen?.id ?? '미대조'}${chosen?.direct ? ' (직접)' : ' (부모)'} | ${f(chosen?.coveredInclusivePercent, 2)} |`; })), '',
  `미대조 행 ${uncovered.length}개입니다. driver·GC·V8 프레임은 위 프로파일 표에 남기되 라이브러리 함수의 share로 덮어씌우지 않았습니다. GC의 할당 영향은 노드/청사진/스키마/revision/scratch 제거 job의 종단 차이에 포함됩니다.`, '',
  '## 보관과 검증', '',
  `raw CPU profile은 \`${summary.method.rawDirectory}\`에만 남겼습니다. 모든 측정 및 요약 파일은 5 MB 이하입니다. 재빌드 가능한 임시 \`.profile-99c01-work\`는 번들 SHA-256을 JSON에 저장한 뒤 삭제했습니다. 생성 번들·source map은 산출물에 포함하지 않았습니다.`, '',
  '[profile-99c01-summary.json](profile-99c01-summary.json)은 방법·환경·번들 hash·22개 프로파일·분기 축·모든 제거 상한·세 run·수정 사양·coverage를 기계 판독 형태로 보존합니다. 개별 paired JSON은 101개 원 관측과 sentinel 보정·관찰값을 보존합니다. 하네스 및 compiler의 Node 구문 검사, 표본 수/파일 크기/프로파일 열과 대조 coverage 검사, HEAD 및 제품 소스 불변·변경 범위 검사를 완료했습니다. 제품 코드의 lint/typecheck/test는 이 분석 작업의 검증 근거로 주장하지 않습니다.', '',
);
if (process.argv[2] === '--audit') console.log(JSON.stringify({ counts: summary.counts, uncovered, zero: bounds.filter(b => b.id === 'gate-evaluation-zero').map(b => ({ operation: op(b), classification: b.classification, delta: b.medianBoundMs, aboveNoise: b.aboveNoise })) }));
else {
  const result = process.argv[2] === '--markdown' ? lines.join('\n') : JSON.stringify(summary, null, 2) + '\n';
  assert(Buffer.byteLength(result) <= 5000000, 'Artifact too large');
  process.stdout.write(result);
}
