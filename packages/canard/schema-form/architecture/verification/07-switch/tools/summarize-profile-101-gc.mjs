// Pure derivation: returns bounded Korean report documents; the caller writes them with the native patch tool.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(directory, '../../../../../..');
const artifacts = path.join(directory, 'profile-101-gc');
const raw = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/prof';
const names = ['nested-d5-f4', 'flat-500', 'oneOf-20'];
const phases = ['blueprint', 'rest', 'garbageCollector', 'program', 'idle', 'driver'];
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const median = values => values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];
const range = values => [Math.min(...values), Math.max(...values)];
const fmt = (value, digits = 3) => value.toFixed(digits);
const bytes = value => Math.round(value).toLocaleString('en-US');
const read = file => JSON.parse(fs.readFileSync(path.join(artifacts, file), 'utf8'));
const runs = (mode, name, variant = 'old', warmup = 20) => [1, 2, 3].map(run =>
  read(`${mode}-${name}-${variant}-w${warmup}-r${run}.summary.json`));
const artifact = row => `${row.mode}-${row.name}-${row.variant}-w${row.warmup}-r${row.run}`;

function compactRun(row) {
  return { artifact: artifact(row) + '.summary.json', samplesArtifact: artifact(row) + '.samples.json',
    run: row.run, mode: row.mode, variant: row.variant, warmup: row.warmup, samples: row.samples,
    started: row.started, ended: row.ended, metrics: row.metrics, meanMs: row.meanMs,
    boundMs: row.boundMs, pairedDelta: row.pairedDelta, pairedMedianIntervalMs: row.pairedMedianIntervalMs,
    emptyBefore: row.emptyBefore, emptyAfter: row.emptyAfter, subtractedEmptyMs: row.subtractedEmptyMs,
    observations: Object.fromEntries(Object.entries(row.observations).map(([version, value]) => [version,
      { sha256: value.sha256, outputBytes: value.outputBytes, liveWidth: value.liveWidth }])) };
}

function ownerAllocations(heapRuns, version) {
  const owners = new Map();
  for (const run of heapRuns) for (const row of run.heap[version].functions) {
    const owner = row.owner ?? row;
    const key = `${owner.function}|${owner.file}:${owner.line}|${row.phase}`;
    if (!owners.has(key)) owners.set(key, { ...owner, phase: row.phase, bytesPerMount: 0, sampleCount: 0 });
    const entry = owners.get(key);
    entry.bytesPerMount += row.bytesPerMount / heapRuns.length;
    entry.sampleCount += row.samples;
  }
  return [...owners.values()].sort((a, b) => b.bytesPerMount - a.bytesPerMount);
}

function traceCounts(name, mode, blueprintNames) {
  return [1, 2, 3].map(run => {
    const record = read(`${mode}-${name}-w20-r${run}.summary.json`);
    const registry = new Map();
    for (const line of record.allOptimizationLines) {
      const match = line.match(/<JSFunction ([^ <]+) <([^>]+)> \(sfi = (0x[0-9a-f]+)\)/);
      if (match) registry.set(match[3], { function: match[1], file: match[2] });
    }
    const counts = new Map(), reasons = {}, allFunctionInvalidationReasons = {};
    let events = 0, optimizedSubmissions = 0, invalidations = 0;
    for (const line of record.measuredOptimizationLines) {
      if (/marking dependent code|^\[bailout/.test(line)) {
        const reason = line.match(/reason: ([^\])]+)/)?.[1] ?? '(unknown)';
        allFunctionInvalidationReasons[reason] = (allFunctionInvalidationReasons[reason] ?? 0) + 1;
      }
      const direct = line.match(/<JSFunction ([^ <]+) <([^>]+)> \(sfi = (0x[0-9a-f]+)\)/);
      const shared = line.match(/\((0x[0-9a-f]+) <SharedFunctionInfo ([^>]+)>\)/);
      const owner = direct ? { function: direct[1], file: direct[2] } : shared ? registry.get(shared[1]) : undefined;
      const fn = owner?.function ?? shared?.[2];
      if (!fn || !blueprintNames.includes(fn) || owner && !owner.file.endsWith('/head.cjs')) continue;
      const type = /marking dependent code/.test(line) ? 'invalidations' : /^\[bailout/.test(line) ? 'bailouts' :
        /^\[compiling method/.test(line) ? 'submissions' : /^\[completed compiling/.test(line) ? 'completed' :
        /^\[completed optimizing/.test(line) ? 'turboFanInstalled' : 'other';
      if (!counts.has(fn)) counts.set(fn, { function: fn, submissions: 0, completed: 0, invalidations: 0, bailouts: 0, turboFanInstalled: 0, other: 0 });
      counts.get(fn)[type]++; events++;
      if (type === 'submissions') optimizedSubmissions++;
      if (type === 'invalidations' || type === 'bailouts') {
        invalidations++;
        const reason = line.match(/reason: ([^\])]+)/)?.[1] ?? '(unknown)';
        reasons[reason] = (reasons[reason] ?? 0) + 1;
      }
    }
    return { run, log: `${mode}-${name}-w20-r${run}.log`, clockedCollections: record.clockedCollections.length,
      optimizationLinesAllFunctions: record.measuredOptimizationLines.length, blueprintEvents: events,
      blueprintSubmissions: optimizedSubmissions, blueprintInvalidations: invalidations, reasons,
      allFunctionInvalidationReasons,
      functions: [...counts.values()].sort((a, b) => b.submissions - a.submissions) };
  });
}

function aggregateCpu(records, version) {
  const functions = new Map();
  for (const record of records) for (const row of record.cpu[version].functions) {
    const key = `${row.function}|${row.file}:${row.line}`;
    if (!functions.has(key)) functions.set(key, { function: row.function, file: row.file, line: row.line,
      selfMsPerMount: 0, inclusiveMsPerMount: 0, blueprintSelfMsPerMount: 0 });
    const entry = functions.get(key);
    entry.selfMsPerMount += row.selfMsPerMount / records.length;
    entry.inclusiveMsPerMount += row.inclusiveMsPerMount / records.length;
    entry.blueprintSelfMsPerMount += (row.selfPhaseMsPerMount?.blueprint ?? 0) / records.length;
  }
  return { clockMedianMs: median(records.map(record => record.metrics[version].median)),
    sampledMsPerMountMean: mean(records.map(record => record.cpu[version].sampledMsPerMount)),
    selectedSamples: records.reduce((sum, record) => sum + record.cpu[version].samples, 0),
    phases: Object.fromEntries(phases.map(phase => [phase, {
      meanMsPerMount: mean(records.map(record => record.cpu[version].phases[phase].msPerMount)),
      medianRunMsPerMount: median(records.map(record => record.cpu[version].phases[phase].msPerMount)),
      runRangeMsPerMount: range(records.map(record => record.cpu[version].phases[phase].msPerMount)) }])),
    functions: [...functions.values()].sort((a, b) => b.selfMsPerMount - a.selfMsPerMount) };
}

export function derive() {
  assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
  const currentHead = execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  assert.equal(currentHead, 'aee63933e43e3f8da442cf3ba7e7574f2aa16679');
  assert.equal(execFileSync('git', ['--no-optional-locks', 'diff', '--numstat', 'HEAD', '--', 'packages/canard/schema-form/src'],
    { cwd: repo, encoding: 'utf8' }).trim(), '');
  const definitions = read('ablations.json');
  const prior = JSON.parse(fs.readFileSync(path.join(directory, 'profile-100c01-summary.json'), 'utf8'));
  const noise = names.map(name => {
    const controls = [...runs('timer', name, 'control'), ...runs('timer-final', name, 'control')];
    return { name, noiseMs: Math.max(...controls.flatMap(row => [Math.abs(row.boundMs), Math.abs(row.pairedDelta.median)])),
      controls: controls.map(compactRun) };
  });
  const bounds = definitions.flatMap(definition => names.map(name => {
    const records = runs('timer', name, definition.id), n = noise.find(row => row.name === name).noiseMs;
    return { id: definition.id, name, classification: definition.classification,
      headMedianMs: median(records.map(row => row.metrics.head.median)),
      variantMedianMs: median(records.map(row => row.metrics[definition.id].median)),
      medianBoundMs: median(records.map(row => row.boundMs)), spreadMs: range(records.map(row => row.boundMs)),
      pairedMedianMs: median(records.map(row => row.pairedDelta.median)), noiseMs: n,
      aboveNoise: records.every(row => row.boundMs > n && row.pairedMedianIntervalMs[0] > 0),
      regressionAboveNoise: records.every(row => row.boundMs < -n && row.pairedMedianIntervalMs[1] < 0),
      resultChanged: records.some(row => row.observations.head.sha256 !== row.observations[definition.id].sha256 ||
        row.observations.head.liveWidth !== row.observations[definition.id].liveWidth),
      runs: records.map(compactRun) };
  }));
  const fixtures = names.map(name => {
    const timer = runs('timer', name), heap = runs('heap', name), memory = runs('memory', name);
    const cpu20 = runs('cpu', name), cpu2000 = runs('cpu', name, 'old', 2000), noForcedGc = runs('cpu-no-forced-gc', name);
    const cacheCpu = runs('cpu', name, 'blueprint-cache');
    const allocations = Object.fromEntries(['head', 'old'].map(version => [version, {
      bytesPerMount: mean(heap.map(row => row.heap[version].bytesPerMount)),
      blueprintBytesPerMount: mean(heap.map(row => row.heap[version].blueprintBytesPerMount)),
      restBytesPerMount: mean(heap.map(row => row.heap[version].restBytesPerMount)),
      unknownBytesPerMount: mean(heap.map(row => row.heap[version].unknownBytesPerMount)),
      restIncludingUnknownBytesPerMount: mean(heap.map(row => row.heap[version].restBytesPerMount + row.heap[version].unknownBytesPerMount)),
      excludedBytesPerMount: mean(heap.map(row => row.heap[version].excludedBytesPerMount)),
      runRangeBytesPerMount: range(heap.map(row => row.heap[version].bytesPerMount)),
      physicalHeapUsedDeltaBytesPerMount: mean(memory.map(row => row.heapUsedDelta[version].meanBytes)),
      noCollectionHeapDelta: memory.every(row => row.heapUsedDelta[version].exactNoCollectionWindows),
      estimatorRelativeDifferencePercent: (mean(heap.map(row => row.heap[version].bytesPerMount)) /
        mean(memory.map(row => row.heapUsedDelta[version].meanBytes)) - 1) * 100,
      topAllocators: ownerAllocations(heap, version) }]));
    const cpu = { warmup20: Object.fromEntries(['head', 'old'].map(version => [version, aggregateCpu(cpu20, version)])),
      warmup2000: Object.fromEntries(['head', 'old'].map(version => [version, aggregateCpu(cpu2000, version)])),
      noForcedGc: Object.fromEntries(['head', 'old'].map(version => [version, aggregateCpu(noForcedGc, version)])) };
    const blueprintNames = cpu.warmup20.head.functions.filter(row => row.file.includes('/core/blueprint/')).map(row => row.function);
    const trace = { forcedGC: traceCounts(name, 'trace', blueprintNames), noForcedGC: traceCounts(name, 'trace-no-forced-gc', blueprintNames) };
    const invalidationNames = trace.forcedGC.flatMap(row => row.functions.filter(fn => fn.invalidations || fn.bailouts).map(fn => fn.function));
    const invalidated = invalidationNames.filter((name, index) => invalidationNames.indexOf(name) === index);
    const affectedSelfMs = cpu.warmup20.head.functions.filter(fn => invalidated.includes(fn.function))
      .reduce((sum, fn) => sum + fn.blueprintSelfMsPerMount, 0);
    const legacyHot = prior.profiles.find(row => row.name === name);
    const matchedDelta = Object.fromEntries(phases.map(phase => [phase,
      mean(cacheCpu.map(row => row.cpu.head.phases[phase].msPerMount - row.cpu['blueprint-cache'].phases[phase].msPerMount))]));
    const historical = prior.bounds.find(row => row.id === 'blueprint' && row.name === name && row.mode === 'mount');
    return { name, clock: { headMedianMs: median(timer.map(row => row.metrics.head.median)),
      oldMedianMs: median(timer.map(row => row.metrics.old.median)), runs: timer.map(compactRun) },
      gc: Object.fromEntries(['head', 'old'].map(version => [version, {
        mounts: 303, gcMeanMsPerMount: mean(timer.map(row => row.gc[version].meanMs)),
        scavengeMeanMsPerMount: mean(timer.map(row => row.gc[version].scavengeMeanMs)),
        markCompactMeanMsPerMount: mean(timer.map(row => row.gc[version].majorMeanMs)),
        incrementalMeanMsPerMount: mean(timer.map(row => row.gc[version].incrementalMeanMs)),
        mountsWithGC: timer.reduce((sum, row) => sum + row.gc[version].mountsWithGC, 0),
        events: timer.reduce((sum, row) => sum + row.gc[version].events, 0) }])),
      allocations, cpu, trace, affectedBlueprintFunctions: invalidated,
      affectedBlueprintSelfMsPerMount: affectedSelfMs,
      affectedBlueprintSelfPercent: affectedSelfMs / cpu.warmup20.head.phases.blueprint.meanMsPerMount * 100,
      hotComparison: { historicalHead: legacyHot.head, hotOperations: legacyHot.operations,
        hotBlueprintCpuMsPerMount: legacyHot.selectedMs / legacyHot.operations,
        historicalWholeAnalysisBoundMs: historical.medianBoundMs,
        sameRegimeBlueprintCpuMedianMs: cpu.warmup20.head.phases.blueprint.medianRunMsPerMount,
        pairedMinusHotMs: cpu.warmup20.head.phases.blueprint.medianRunMsPerMount - legacyHot.selectedMs / legacyHot.operations },
      matchedCacheCpu: { phaseDeltaMeanMsPerMount: matchedDelta,
        totalDeltaMeanMsPerMount: Object.values(matchedDelta).reduce((sum, value) => sum + value, 0),
        nonBlueprintDeltaMeanMsPerMount: Object.entries(matchedDelta).filter(([key]) => key !== 'blueprint').reduce((sum, [, value]) => sum + value, 0),
        runs: cacheCpu.map(compactRun) },
      noForcedGcClockedGcMeanMs: Object.fromEntries(['head', 'old'].map(version => [version,
        mean(noForcedGc.map(row => row.gc[version].meanMs))])),
      cpuProfilerClockOverheadPercent: (cpu.warmup20.head.clockMedianMs / median(timer.map(row => row.metrics.head.median)) - 1) * 100,
      artifacts: { heap: heap.map(artifact), memory: memory.map(artifact), cpu20: cpu20.map(artifact),
        cpu2000: cpu2000.map(artifact), noForcedGC: noForcedGc.map(artifact), matchedCacheCpu: cacheCpu.map(artifact) } };
  });
  const allocationAudits = ['nodes-replay', 'declarations-replay', 'load-zero', 'nodes-empty-hosts',
    'declarations-empty-arrays', 'load-frame-pool'].map(id => {
    const row = read(`heap-nested-d5-f4-${id}-w20-r1.summary.json`);
    return { id, samples: 101, runs: 1, classification: definitions.find(definition => definition.id === id).classification,
      headBytesPerMount: row.heap.head.bytesPerMount, variantBytesPerMount: row.heap[id].bytesPerMount,
      avoidedBytesPerMount: row.heap.head.bytesPerMount - row.heap[id].bytesPerMount,
      headTopAllocators: ownerAllocations([row], 'head').slice(0, 10), variantTopAllocators: ownerAllocations([row], id).slice(0, 10),
      artifact: artifact(row) + '.summary.json' };
  });
  const records = fs.readdirSync(artifacts).filter(file => file.endsWith('.summary.json')).map(read)
    .filter(row => row.metrics && row.samples === 101);
  let measuredWindows = 0;
  for (const record of records) {
    assert.equal(record.head, currentHead);
    const samples = read(artifact(record) + '.samples.json');
    assert.equal(samples.windows.length, 202); measuredWindows += 202;
    for (const version of ['head', record.variant]) assert.equal(samples.timingsMs[version].length, 101);
    if (record.cpu) for (const version of ['head', record.variant]) {
      const sum = phases.reduce((total, phase) => total + record.cpu[version].phases[phase].msPerMount, 0);
      assert(Math.abs(sum - record.cpu[version].sampledMsPerMount) < 1e-8);
    }
  }
  const builds = fs.readdirSync(artifacts).filter(file => file.startsWith('build-')).map(read);
  assert(builds.every(record => record.naturalServiceExits === 1));
  assert.equal(builds.find(row => row.variant === 'head').sha256, builds.find(row => row.variant === 'control').sha256);
  const walk = base => fs.readdirSync(base, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(base, entry.name); return entry.isDirectory() ? walk(file) : [file];
  });
  const artifactFiles = walk(artifacts), rawFiles = fs.readdirSync(raw).filter(file => file.startsWith('101-')).map(file => path.join(raw, file));
  const stats = files => ({ files: files.length, totalBytes: files.reduce((sum, file) => sum + fs.statSync(file).size, 0),
    maxFileBytes: Math.max(...files.map(file => fs.statSync(file).size)) });
  const caps = { perRun: stats(artifactFiles), rawProfiles: stats(rawFiles) };
  assert(caps.perRun.maxFileBytes <= 5_000_000 && caps.rawProfiles.maxFileBytes <= 5_000_000);
  const summary = { head: currentHead, generatedAt: new Date().toISOString(), environment: runs('timer', names[0])[0].environment,
    method: '99C-01/100 paired mount와 같은 fresh process, warmup 20, 101쌍×3, 순서 교대, clock 밖 스키마 복제·강제 GC; source bundle의 함수 계측 없음.',
    allocationMethod: '2048-byte V8 sampling, 각 measured window만 start/stop, major/minor 수거 객체 포함. blueprint 호출 조상으로 분석/나머지를 분할합니다.',
    cpuDenominator: '101개 clock window의 모든 표본 간격: (garbage collector), (program), (idle)를 포함하며 창 경계에서 간격을 잘라 냅니다.',
    estimatorPolicy: '할당량은 303개 mount의 산술 평균입니다. 위치미상 bytes는 총량과 그외 상한에 보존합니다. CPU phase 표는 산술 평균, 대표 분석 CPU는 회차 평균 3개의 중앙값입니다.',
    noisePolicy: '전후 H↔H 6회에서 max(abs(중앙값 차이),abs(paired 중앙값)); 세 bound 모두 N 초과 및 paired rank 41~61/101 구간 하한>0일 때 aboveNoise.',
    fixtures, noise, bounds, allocationAudits, contentCheck: read('content-check.summary.json'), builds,
    exploratoryFrozenArrayRetention: compactRun(read('cpu-retain-frozen-types-nested-d5-f4-old-w20-r1.summary.json')),
    rawProfileDirectory: raw, verification: { sourceDiffEmpty: true, headControlBundlesIdentical: true,
      successfulFreshMeasurementWorkers: records.length, measuredWindows, naturallyExitingBuildServices: builds.length,
      caps, processRule: '각 child의 signal=null,status=0을 CLI가 검사했고 esbuild stdin EOF 종료를 확인했습니다. kill/timeout 종료는 사용하지 않았습니다.',
      excludedPilot: '초기 heap pilot의 마지막 sample nodeId 누락으로 자연 exit 1이 발생했습니다. 위치미상 bytes를 보존하도록 수정하고 전체 해당 회차를 새 process로 재측정했습니다.' },
    classification: [
      { finding: 'clock 안 GC가 missing time을 설명하지 않음; clock 밖 강제 GC 뒤 최적화 무효화·재컴파일이 반복됨', kind: 'structural',
        spec: 'benchmark/JIT regime의 영향입니다. warmup 횟수만 늘리거나 GC pause를 CPU 표본에서 제거해서 제품 수정의 이득으로 해석하지 않습니다.' },
      { finding: '차가운 청사진의 완전한 node/declaration/fragment 내용과 eager hydration이 큰 할당을 소유함', kind: 'structural',
        spec: '완성 그래프를 폼 사이에서 재사용하거나 hydration을 생략한 수치는 천장입니다. 새 root 참조·predicate identity·cache 수명·정적 오류/경고의 재노출 계약을 바꾸는 결정이 필요합니다.' },
      { finding: 'buildNodes의 빈 host 경로 임시 배열·JSON 쌍 직렬화', kind: 'code-level',
        spec: '한 ungated contribution의 내부 bound key를 별도 tag+기존 template key로 구성하고 그외 경로는 기존 host binding을 유지합니다. node/declaration/fragment/dependency/expression 내용, 동결·원본 참조, predicate별 결과와 모든 정적 오류·경고를 유지해야 합니다. guarded 변형은 flat만 3회 N 초과입니다.' },
      { finding: 'collectDeclarations의 증명된 빈 gate/order/unused overlay 목록', kind: 'code-level',
        spec: '변경되지 않는 빈 목록만 module-owned frozen 값으로 공유하고 필요한 mutable children·declares·활성 gate·상속 overlay는 독립 소유합니다. 원래 검사·진단·내용을 유지합니다. mount 개선은 재현되지 않았습니다.' },
      { finding: 'loadStaticFirstTree의 반복 DFS frame', kind: 'code-level',
        spec: '한 mount의 stack 깊이별 frame만 재사용하며 모든 필드를 초기화합니다. 실제 node/child/value 생성, required·automatic 처리, commit·delivery·warning 순서는 그대로 유지합니다. mount 개선은 재현되지 않았습니다.' },
      { finding: 'oneOf의 resolveDependencyPath 호출당 문자열·분할 작업', kind: 'code-level',
        spec: 'root/host path와 authored dependency identity가 완전히 같은 정적 해석만 runtime 안에서 재사용하는 후보입니다. 경로 오류 및 경고는 원래 위치에서 재노출하고 array index·root·expression 변경에 무효화해야 합니다. 호출순서 replay는 이 사양의 구현이 아닌 측정 상한입니다.' }
    ] };
  const md = ['# 101 — paired mount의 GC·할당·CPU·JIT 귀속', '',
    `HEAD \`${currentHead}\`에서 측정했습니다. clock 안 GC pause는 세 fixture의 새·0.16.0 엔진 모두 **0 ms, 0/303 mount**입니다. 기존 hot 분석 수치와 제거 상한의 차이는 같은 clock regime의 분석 CPU가 훨씬 크다는 점으로 설명됩니다. 강제 GC는 clock 밖에 있지만 최적화된 code의 약한 참조와 field-type feedback을 무효화하여 다음 mount에 영향을 주었습니다.`, '',
    '## 측정 조건과 재현', '',
    `- worktree: \`${repo}\`; 제품 \`src\` diff는 비어 있습니다. git write, 설치, 다른 agent, 동시 benchmark, kill은 없었습니다.`,
    '- 새 엔진은 HEAD source를 production define으로 bundle한 원본이며 함수 내부 timer/counter를 넣지 않았습니다. 0.16.0은 `src/__legacy__/core/nodeFromJSONSchema.ts`입니다. esbuild 설정·fixture·create·64회 microtask와 setImmediate 배출은 기존 99C-01 도구를 메모리에서 재사용했습니다.',
    '- fresh process에서 fixture별 warmup 20쌍 뒤 101 measured쌍을 실행했고 이를 3회 반복했습니다. 회차 첫 순서는 H-V/V-H/H-V이며 매 sample 교대합니다. schema clone·강제 GC는 각 mount의 clock 밖, empty sentinel 101회씩 전후 중앙값 평균은 clock에서 뺍니다.',
    '- GC/기본 clock, CPU sampling, heap sampling은 별도 순차 process입니다. CPU profiler는 warmup 종료 뒤 시작하고 101개 창만 선택했습니다. 2,000 warmup과 강제 GC 생략은 별도 비교입니다. 강제 GC 생략 결과는 주 regime의 성능 수치에 섞지 않았습니다.',
    `- 환경: Node ${summary.environment.node}, V8 ${summary.environment.v8}, esbuild ${summary.environment.esbuild}; ${summary.environment.cpu}, ${summary.environment.platform}/${summary.environment.arch}; production, validation=off, subscribers=0.`,
    '- clock bound는 profiler를 켜지 않은 timer 결과만 사용합니다. heap profiler의 약 3~4배 clock 증가는 이득 판정에서 제외했습니다.', '',
    '```sh',
    'D=packages/canard/schema-form/architecture/verification/07-switch',
    'node "$D/tools/profile-101-gc.mjs" --build head control old',
    'node "$D/tools/profile-101-gc.mjs" --phase timer old 20 3',
    'node "$D/tools/profile-101-gc.mjs" --phase timer control 20 3',
    'node "$D/tools/profile-101-gc.mjs" --phase cpu old 20 3',
    'node "$D/tools/profile-101-gc.mjs" --phase heap old 20 3',
    'node "$D/tools/profile-101-gc.mjs" --trace-phase 20 3',
    'node "$D/tools/profile-101-gc.mjs" --phase cpu old 2000 3',
    'node "$D/tools/profile-101-gc.mjs" --phase cpu-no-forced-gc old 20 3',
    'node "$D/tools/profile-101-gc.mjs" --trace-phase 20 3 trace-no-forced-gc',
    'node "$D/tools/profile-101-gc.mjs" --phase memory old 20 3',
    'node "$D/tools/profile-101-gc.mjs" --phase timer-final control 20 3',
    'node "$D/tools/check-profile-101-content.mjs"',
    '```', '',
    '변형은 `profile-101-gc/ablations.json`의 ID를 `--build`와 `--bounds`에 순서대로 전달합니다. 각 ID를 AST/문자열의 유일한 anchor로 메모리 안에서만 적용했습니다. 원시 자료·환경·empty 값·101개 timings·paired deltas·창 경계·출력 hash는 회차별 artifact에 남아 있습니다.', '',
    '## (a) 실제 clock 안 GC와 발생률 — structural', '',
    '| fixture | 새/구 mount 중앙값 ms | 새 Scavenge / Mark-Compact ms/mount | 구 Scavenge / Mark-Compact ms/mount | 새/구 GC 포함 mount |',
    '|---|---:|---:|---:|---:|'];
  for (const row of fixtures) md.push(`| ${row.name} | ${fmt(row.clock.headMedianMs)} / ${fmt(row.clock.oldMedianMs)} | ${fmt(row.gc.head.scavengeMeanMsPerMount)} / ${fmt(row.gc.head.markCompactMeanMsPerMount)} | ${fmt(row.gc.old.scavengeMeanMsPerMount)} / ${fmt(row.gc.old.markCompactMeanMsPerMount)} | ${row.gc.head.mountsWithGC}/303 / ${row.gc.old.mountsWithGC}/303 |`);
  md.push('', 'PerformanceObserver `gc` entry의 startTime/duration을 실제 clock window와 겹친 길이로 합산했고 kind 1/4를 minor/major로 나눴습니다. incremental도 주 regime에서 0입니다. 별도 `--trace-gc` 3회씩에서도 모든 measured 창의 collection이 0이었습니다. observer가 수집을 놓친 결과는 아닙니다. 강제 GC를 생략한 비교에서는 창 안 collection을 실제로 검출했습니다.', '',
    'CPU profiler의 `(garbage collector)` 표본은 아래에 포함하지만 이를 위 GC pause로 대체하지 않습니다. 같은 process에서도 이 표본 bucket은 양수인 반면 observer·native GC trace의 실제 창 안 수집은 0입니다. bucket의 정확한 native 원인까지 단정하지 않고 별도 귀속으로 보존했습니다.', '',
    '## (b) 총 할당과 청사진/나머지 — structural 비용과 code-level 임시값', '',
    '단위는 byte/mount입니다. 2,048-byte sampling에서 major/minor GC로 수거된 객체도 포함했으며 clone·강제 GC·observer/inspector 준비 등의 창 밖 호출은 제외했습니다. `blueprint` 호출 조상 아래를 분석으로, 나머지 mount/배출을 rest로 분할했습니다. 아래 그외에는 위치미상 byte의 보수적 상한을 포함합니다.', '',
    '| fixture | 새 총량 | 새 청사진 | 새 그외 | 구 총량=그외 | 위치미상 새/구 | profiler 없는 heap 증가 새/구 |',
    '|---|---:|---:|---:|---:|---:|---:|');
  for (const row of fixtures) md.push(`| ${row.name} | ${bytes(row.allocations.head.bytesPerMount)} | ${bytes(row.allocations.head.blueprintBytesPerMount)} | ${bytes(row.allocations.head.restIncludingUnknownBytesPerMount)} | ${bytes(row.allocations.old.bytesPerMount)} | ${bytes(row.allocations.head.unknownBytesPerMount)} / ${bytes(row.allocations.old.unknownBytesPerMount)} | ${bytes(row.allocations.head.physicalHeapUsedDeltaBytesPerMount)} / ${bytes(row.allocations.old.physicalHeapUsedDeltaBytesPerMount)} |`);
  md.push('', '할당 표본은 통계적 추정치이며 회차간 spread는 JSON에 있습니다. 수집이 없는 같은 clock 창에서 `used_heap_size`를 전후 읽은 별도 101×3 비교도 남겼습니다. snapshot 호출·clock 직후 wrapper의 작은 추가 할당이 포함되므로 절대 기준으로 동일시하지 않으며, 관측 차이는 약 0.0~4.3%였습니다. nested의 총량은 거의 일치했습니다. 일부 stopSampling 결과의 마지막 ordinal이 호출 트리 없는 nodeId를 참조하여 초기 pilot이 실패했으나, 본 자료에서는 그 byte를 버리지 않고 위치미상으로 보존했습니다.', '',
    '자기 할당을 **가장 가까운 제품 source 함수**에 귀속했습니다. native `push`/`add`/`next` 등은 source 호출자로 연결했고 callee의 할당을 호출자의 자기 할당에 이중 합산하지 않았습니다. 위치는 source map의 함수 진입 위치이며 정확한 object literal 한 줄을 주장하지 않습니다.', '');
  for (const fixture of fixtures) {
    md.push(`### ${fixture.name}의 상위 할당 함수`, '', '| 엔진 | 함수 | byte/mount | 분석/그외 | source |', '|---|---|---:|---|---|');
    for (const version of ['head', 'old']) for (const row of fixture.allocations[version].topAllocators.slice(0, 5))
      md.push(`| ${version === 'head' ? '새' : '0.16.0'} | \`${row.function}\` | ${bytes(row.bytesPerMount)} | ${row.phase} | \`${row.file}:${row.line}\` |`);
    md.push('');
  }
  md.push('nested/flat의 공통 상위 3개는 `buildNodes`, `collectDeclarations`, `loadStaticFirstTree`입니다. 새 nested의 분석 외 할당은 구 엔진보다 작지만, 차가운 분석이 약 15.77 MB를 추가하여 총량이 커졌습니다. oneOf는 runtime 경로 해석·gate 투영도 큰 비중을 차지하며 `resolveDependencyPath`가 가장 큽니다.', '',
    '## (c) 같은 101개 창의 CPU와 JIT — structural', '',
    '각 칸은 3회×101개 창의 산술 평균 ms/mount입니다. 합계 분모는 GC·program·idle·driver를 모두 포함합니다. profiler의 native sampling 간격을 창 경계에서 잘랐으며 표본 수와 전체 함수 self/inclusive 값은 회차별 JSON에 있습니다.', '',
    '| fixture/엔진 | 청사진 | 그외 engine | GC bucket | program | idle+driver | 전체 표본 시간 |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const fixture of fixtures) for (const version of ['head', 'old']) {
    const cpu = fixture.cpu.warmup20[version], p = cpu.phases;
    md.push(`| ${fixture.name}/${version === 'head' ? '새' : '구'} | ${fmt(p.blueprint.meanMsPerMount)} | ${fmt(p.rest.meanMsPerMount)} | ${fmt(p.garbageCollector.meanMsPerMount)} | ${fmt(p.program.meanMsPerMount)} | ${fmt(p.idle.meanMsPerMount + p.driver.meanMsPerMount)} | ${fmt(cpu.sampledMsPerMountMean)} |`);
  }
  md.push('', '대표 분석 값은 회차별 분석 평균 3개의 중앙값으로 비교했습니다. 기존 hot 루프는 다른 commit의 standalone 분석이며 GC/program 및 분석 밖 호출이 분모에서 빠졌습니다. 이 역사 수치를 현재 budget의 항처럼 정확히 더하지 않습니다.', '',
    '| fixture | 기존 hot 분석 ms | 동일 paired regime 분석 ms | 차이 | warmup 2000 분석 ms | 강제 GC 생략 분석 ms |', '|---|---:|---:|---:|---:|---:|');
  for (const fixture of fixtures) md.push(`| ${fixture.name} | ${fmt(fixture.hotComparison.hotBlueprintCpuMsPerMount)} | ${fmt(fixture.hotComparison.sameRegimeBlueprintCpuMedianMs)} | +${fmt(fixture.hotComparison.pairedMinusHotMs)} | ${fmt(fixture.cpu.warmup2000.head.phases.blueprint.medianRunMsPerMount)} | ${fmt(fixture.cpu.noForcedGc.head.phases.blueprint.medianRunMsPerMount)} |`);
  md.push('', ...fixtures.slice(0, 2).map(fixture => {
    const comparison = fixture.hotComparison;
    const cacheBound = bounds.find(row => row.id === 'blueprint-cache' && row.name === fixture.name);
    return `${fixture.name}의 역사적 구멍 ${fmt(comparison.historicalWholeAnalysisBoundMs)}−${fmt(comparison.hotBlueprintCpuMsPerMount)}=${fmt(comparison.historicalWholeAnalysisBoundMs - comparison.hotBlueprintCpuMsPerMount)} ms에 대해 현재 동일-regime 분석은 ${fmt(comparison.sameRegimeBlueprintCpuMedianMs)} ms, hot 대비 +${fmt(comparison.pairedMinusHotMs)} ms입니다. clock 안 GC에 그 시간을 옮겨 잡을 근거는 없습니다. 현재 HEAD의 전체 분석 제거 상한 ${fmt(cacheBound.medianBoundMs)} ms는 역사적 제거 값과 구분합니다.`;
  }), '',
    '전체 분석 재사용과 HEAD를 **같은 CPU paired process**에서 비교하면 제거 효과가 분석 함수의 시간만은 아니라는 것도 드러납니다. 아래는 303개 창의 정확한 표본 차이 분해입니다.', '',
    '| fixture | 청사진 Δ | 그외 engine Δ | GC bucket Δ | program Δ | idle+driver Δ | 표본 합계 Δ | 비계측 clock 제거 상한 |', '|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const fixture of fixtures) {
    const p = fixture.matchedCacheCpu.phaseDeltaMeanMsPerMount;
    md.push(`| ${fixture.name} | ${fmt(p.blueprint)} | ${fmt(p.rest)} | ${fmt(p.garbageCollector)} | ${fmt(p.program)} | ${fmt(p.idle + p.driver)} | ${fmt(fixture.matchedCacheCpu.totalDeltaMeanMsPerMount)} | ${fmt(bounds.find(row => row.id === 'blueprint-cache' && row.name === fixture.name).medianBoundMs)} |`);
  }
  md.push('', 'nested에는 분석 외 표본 차이가 약 1.256 ms, flat에는 약 0.347 ms 있습니다. 재사용된 분석 결과는 이후 mount의 할당·형상 feedback·native 상태에도 영향을 줍니다. 이 차이를 청사진 함수 자기 시간으로 강제로 배분하지 않습니다. CPU profiler를 켠 주 실행의 HEAD clock 중앙값은 비계측보다 fixture별 약 6~13% 컸고, 표본 평균과 clock 중앙값도 다른 통계입니다.', '',
    '`--trace-opt/--trace-deopt`는 측정 구간에서도 반복 compilation과 무효화를 보였습니다. 아래 두 reason의 전체 함수 event 수는 native trace의 직접 관측값이고, function별 blueprint event 집계는 JSON에 분리했습니다.', '',
    '| fixture | forced GC의 최적화 trace line 범위 | GC 생략의 trace line 범위 | 무효화 함수의 분석 자기 시간 비중 |', '|---|---:|---:|---:|');
  for (const fixture of fixtures) md.push(`| ${fixture.name} | ${range(fixture.trace.forcedGC.map(row => row.optimizationLinesAllFunctions)).join('~')} | ${range(fixture.trace.noForcedGC.map(row => row.optimizationLinesAllFunctions)).join('~')} | ${fmt(fixture.affectedBlueprintSelfPercent, 1)}% |`);
  const firstReasons = fixtures[0].trace.forcedGC[0].allFunctionInvalidationReasons;
  md.push('', `nested 첫 forced-GC 회차에는 전체 함수 기준 \`embedded weak objects cleared\` ${firstReasons['embedded weak objects cleared']}회, \`dependent field type changed\` ${firstReasons['dependent field type changed']}회가 있었습니다. blueprint의 \`resolveNodeTypes\`, \`collectDeclarations\`, \`buildNodes\` 등이 다시 MAGLEV/TURBOFAN compilation을 요청했습니다. 이들은 이미 충분히 호출되었더라도 다음 GC/field 변화에 code가 무효화될 수 있습니다. 위 자기 시간 비중은 무효화가 관측된 함수들의 귀속 규모이며, sample별 tier 정보가 없으므로 실제 unoptimized 실행 비율이라고 부르지 않습니다.`, '',
    'warmup을 20→2000으로 바꾸어도 분석 비용이 내려가지 않았습니다. forced GC만 생략한 별도 비교는 nested 분석 8.183→5.225 ms, flat 3.009→1.670 ms였으며 최적화 trace도 크게 줄었습니다. 대신 새 nested/flat 창 안 실제 GC는 각각 약 ' + fmt(fixtures[0].noForcedGcClockedGcMeanMs.head) + '/' + fmt(fixtures[1].noForcedGcClockedGcMeanMs.head) + ' ms/mount가 들어왔습니다. 단순 warmup 부족과 clock 안 GC 제외만으로 문제를 설명할 수 없으며 GC를 clock 밖으로 옮기는 정책이 다음 mount의 JIT 상태까지 바꿉니다. 대표적인 frozen-array 6개를 강하게 보유한 단일 추가 탐색은 nested 분석 비용을 낮추지 못하여, frozen-array map 보유 하나가 완성된 해결책이라는 가설도 지지하지 않았습니다.', '',
    '## (d) 상위 할당 함수의 제거 상한과 제한적 회피', '',
    '| fixture | N ms (전후 H↔H 6회) |', '|---|---:|');
  for (const row of noise) md.push(`| ${row.name} | ${fmt(row.noiseMs, 6)} |`);
  md.push('', '상한은 각 회차 HEAD 중앙값−variant 중앙값이며 대표값은 세 상한의 중앙값입니다. **세 회차 모두 N 초과이고 paired rank 구간 하한이 양수일 때만 재현된 이득**으로 표시합니다. 단일 큰 회차나 profiler clock을 이득으로 쓰지 않았습니다. 함수/하위 작업 재사용은 allocation뿐 아니라 CPU work·JIT·lifetime도 바꾸므로 순수 byte당 비용으로 해석하거나 상한들을 합산하지 않습니다.', '',
    '| 변형 / 분류 | fixture | 상한 ms | 세 회차 범위 ms | N 초과 재현 | 출력 변경 |', '|---|---|---:|---:|---|---|');
  for (const row of bounds) md.push(`| \`${row.id}\` / ${row.classification} | ${row.name} | ${fmt(row.medianBoundMs)} | ${row.spreadMs.map(value => fmt(value)).join('~')} | ${row.aboveNoise ? '예' : '아니요'} | ${row.resultChanged ? '예' : 'fixture 관측값 일치'} |`);
  md.push('', '`nodes-replay`는 root buildNodes가 생성한 node·fragment·분석 context를 재사용해 해당 할당과 하위 분석을 없앴습니다. `declarations-replay`는 declaration/fragment와 context 변경을 재생해 해당 함수의 할당·검사를 없앴습니다. `load-zero`는 hydration을 생략해 실제 children/frame 생성과 관련 작업을 없앴고 nested/flat 출력이 바뀌었습니다. oneOf는 이 narrow static loader를 사용하지 않아 그 제거 이득이 재현되지 않았습니다. 모든 변형은 측정 전용이며 생산 소스에 적용하지 않았습니다.', '',
    '동일 101개 nested 창의 추가 heap audit 1회는 회피가 실제 byte 감소로 이어졌음을 보였습니다. 이 audit은 byte 검증이며 세 회차 wall bound의 대체가 아닙니다.', '',
    '| 변형 | HEAD byte/mount | 변형 byte/mount | 감소 byte/mount |', '|---|---:|---:|---:|');
  for (const row of allocationAudits) md.push(`| \`${row.id}\` | ${bytes(row.headBytesPerMount)} | ${bytes(row.variantBytesPerMount)} | ${bytes(row.avoidedBytesPerMount)} |`);
  md.push('', '## code-level 수정 사양과 structural 판단', '');
  for (const row of summary.classification) md.push(`- **${row.kind} — ${row.finding}**: ${row.spec}`);
  md.push('', '빈 host 배열 회피의 전체-scan 변형은 flat에서 재현 기준을 통과했습니다. nested는 세 회차 중앙값 차이가 N을 넘었지만 paired rank 구간 조건을 통과하지 못했고 oneOf 값은 혼재했습니다. 한 ungated contribution에만 fast path를 둔 guarded 변형으로 다시 측정했을 때 flat은 +0.136 ms로 3회 N 초과, nested는 +0.603 ms 중앙값이지만 한 회차 +0.257 ms가 N 아래라 재현 판정을 통과하지 못했습니다. gated 일반 경로의 작은 변화도 cold JIT 결과를 바꾸므로 보편적인 nested 개선을 주장하지 않습니다. 선언 빈 목록 공유와 frame 재사용은 실제 할당을 줄였지만 mount 이득의 재현 기준을 통과하지 못했습니다.', '',
    '제한적 code-level 변형 4개는 canonical 59개 스키마×predicate 설정 4개의 **944회** graph/diagnostic 비교에서 HEAD와 일치했습니다. 기본 결과 140개 성공·96개 거절과 진단 124개가 그대로였고 원본 schema 참조·predicate identity·graph 동결도 확인했습니다. 세 fixture의 전체 mount tree와 onChange 전달도 일치했습니다. 이 검증 범위를 완전한 제품 regression 승인으로 확대하지 않습니다.', '',
    '## 자료와 최종 검증', '',
    `- 실행 자료: [profile-101-gc/](profile-101-gc/); 통합 수치: [profile-101-gc-summary.json](profile-101-gc-summary.json).`,
    '- 도구: [profile-101-gc.mjs](tools/profile-101-gc.mjs), [content check](tools/check-profile-101-content.mjs), [순수 report derivation](tools/summarize-profile-101-gc.mjs).',
    `- 원시 CPU/heap profile: \`${raw}\`. 이 작업의 prefix \`101-\` 파일 ${caps.rawProfiles.files}개, 최대 ${bytes(caps.rawProfiles.maxFileBytes)} bytes입니다.`,
    `- 성공한 fresh measurement worker ${records.length}개, 보존된 measured 창 ${measuredWindows}개, EOF 자연 종료 build service ${builds.length}개입니다. 모든 회차 timing 길이와 CPU 분모 phase 합계를 검사했습니다.`,
    `- per-run 파일 최대 ${bytes(caps.perRun.maxFileBytes)} bytes이며 raw/per-run 모든 파일은 decimal 5 MB 이하입니다. 생성 보고서도 같은 한도를 확인합니다.`,
    '- 초기 heap pilot의 자연 exit 1은 본 결과에서 제외했고 마지막 sample nodeId 누락을 처리한 뒤 해당 전체 회차를 새 process로 다시 실행했습니다. 제품 source diff와 HEAD는 최종 검사에서 그대로였습니다.', '');
  const markdown = md.join('\n');
  summary.functionDetailPolicy = '통합 JSON에는 CPU 자기 시간 상위 25개와 source 할당 상위 20개를 보존합니다. 전체 함수·sample·phase 자료는 회차별 summary/samples와 원시 profile에 있습니다. trace와 phase 총량은 생략하지 않습니다.';
  for (const fixture of fixtures) {
    for (const regime of Object.values(fixture.cpu)) for (const cpu of Object.values(regime)) {
      cpu.functionCount = cpu.functions.length;
      cpu.functions = cpu.functions.slice(0, 25);
    }
    for (const allocation of Object.values(fixture.allocations)) {
      allocation.allocatorCount = allocation.topAllocators.length;
      allocation.topAllocators = allocation.topAllocators.slice(0, 20);
    }
  }
  assert(Buffer.byteLength(markdown) <= 5_000_000);
  assert(Buffer.byteLength(JSON.stringify(summary)) <= 5_000_000);
  return { summary, markdown };
}
