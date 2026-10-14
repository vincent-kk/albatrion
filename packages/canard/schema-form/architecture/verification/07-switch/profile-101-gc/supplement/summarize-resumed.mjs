// Analysis artifact: reads only completed runs in this directory and emits the report extension as JSON.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const artifacts = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(artifacts, '../..');
const repo = path.resolve(directory, '../../../../../..');
const expectedHead = 'cbb66e885f7b72c7dcc7e71d1f427f5d193626f1';
const originalHead = 'aee63933e43e3f8da442cf3ba7e7574f2aa16679';
const names = ['nested-d5-f4', 'flat-500', 'oneOf-20'];
const hot = { 'nested-d5-f4': 4.695, 'flat-500': 1.450, 'oneOf-20': .258 };
const historicGaps = { 'nested-d5-f4': 3.487, 'flat-500': 1.559, 'oneOf-20': .672 };
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length * .5) - 1];
const spread = values => [Math.min(...values), Math.max(...values)];
const close = (actual, expected) => assert(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const relative = file => path.relative(directory, file);
const processes = [];
const git = args => execFileSync('git', ['--no-optional-locks', ...args], { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(git(['rev-parse', 'HEAD']), expectedHead);
assert.equal(git(['diff', '--numstat', 'HEAD', '--', 'packages/canard/schema-form/src']), '');
const sourceTree = git(['rev-parse', 'HEAD:packages/canard/schema-form/src']);
assert.equal(sourceTree, git(['rev-parse', `${originalHead}:packages/canard/schema-form/src`]));
const builds = ['head', 'old'].map(version => {
  const file = path.join(directory, 'profile-101-gc/bundles', version + '.cjs');
  const record = read(path.join(directory, 'profile-101-gc', 'build-' + version + '.summary.json'));
  const sha256 = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(sha256, record.sha256);
  return { version, sha256, bytes: fs.statSync(file).size };
});

function records(mode, name) {
  return [1, 2, 3].map(run => {
    const tag = `${mode}-${name}-old-w20-r${run}`;
    const file = path.join(artifacts, tag + '.summary.json');
    const row = read(file), samples = read(path.join(artifacts, tag + '.samples.json'));
    const processRecord = read(path.join(artifacts, tag + '.process.json'));
    assert.equal(row.head, expectedHead);
    assert.equal(row.name, name); assert.equal(row.run, run); assert.equal(row.mode, mode);
    assert.equal(row.variant, 'old'); assert.equal(row.warmup, 20); assert.equal(row.samples, 101);
    assert.equal(row.forcedGC, mode !== 'editor-timer-steady');
    assert.equal(row.environment.node, 'v26.10.0');
    assert.equal(row.environment.v8, '14.6.202.34-node.35');
    assert.equal(processRecord.status, 0); assert.equal(processRecord.signal, null);
    const elapsedMs = Date.parse(processRecord.ended) - Date.parse(processRecord.started);
    assert(elapsedMs >= 0 && elapsedMs < 480000);
    assert.equal(row.execArgv.includes('--max-semi-space-size=64'), mode.endsWith('ss64'));
    assert.equal(samples.pairedDeltasMs.length, 101); assert.equal(samples.windows.length, 202);
    for (const version of ['head', 'old']) {
      assert.equal(samples.timingsMs[version].length, 101);
      assert.equal(samples.gc[version].length, 101);
      close(median(samples.timingsMs[version]) - row.subtractedEmptyMs, row.metrics[version].median);
      close(mean(samples.timingsMs[version]) - row.subtractedEmptyMs, row.meanMs[version]);
      close(mean(samples.gc[version].map(sample => sample.totalMs)), row.gc[version].meanMs);
      assert.equal(row.gc[version].mountsWithGC, samples.gc[version].filter(sample => sample.events).length);
      assert.equal(samples.windows.filter(window => window.version === version).length, 101);
      if (mode.startsWith('editor')) {
        assert.equal(row.gc[version].mountsWithGC, mode.endsWith('forced') ? 0 : row.gc[version].mountsWithGC);
        assert.equal(samples.emptyTimingsMs.before.length, 101);
        assert.equal(samples.emptyTimingsMs.after.length, 101);
        close(median([...samples.emptyTimingsMs.before, ...samples.emptyTimingsMs.after]), row.subtractedEmptyMs);
      }
      if (row.cpu) {
        close(Object.values(row.cpu[version].phases).reduce((sum, phase) => sum + phase.msPerMount, 0), row.cpu[version].sampledMsPerMount);
        close(row.cpu[version].denominatorMs / 101, row.cpu[version].sampledMsPerMount);
      }
      if (row.heap) {
        const heap = row.heap[version];
        assert.equal(row.samplingIntervalBytes, 1);
        assert(row.execArgv.includes('--sampling-heap-profiler-suppress-randomness'));
        close(heap.objectsPerMount, heap.blueprintObjectsPerMount + heap.restObjectsPerMount + heap.unknownObjectsPerMount);
        close(heap.bytesPerMount, heap.blueprintBytesPerMount + heap.restBytesPerMount + heap.unknownBytesPerMount);
        close(heap.functions.reduce((sum, fn) => sum + fn.samples, 0) / 101 + heap.unknownObjectsPerMount, heap.objectsPerMount);
        close(heap.functions.reduce((sum, fn) => sum + fn.bytes, 0) / 101 + heap.unknownBytesPerMount, heap.bytesPerMount);
        const mounts = read(path.join(artifacts, `${tag}-${version}.heap-mounts.json`));
        assert.equal(mounts.length, 101);
        close(mean(mounts.map(mount => mount.objects)), heap.objectsPerMount);
        close(mean(mounts.map(mount => mount.bytes)), heap.bytesPerMount);
      }
    }
    processes.push({ artifact: relative(path.join(artifacts, tag + '.process.json')), tag,
      started: processRecord.started, ended: processRecord.ended, elapsedMs, status: 0, signal: null });
    return { ...row, artifact: relative(file), samplesArtifact: relative(path.join(artifacts, tag + '.samples.json')) };
  });
}

function clocks(rows) {
  const headMs = median(rows.map(row => row.metrics.head.median));
  const oldMs = median(rows.map(row => row.metrics.old.median));
  return { headMs, oldMs, newOldRatio: headMs / oldMs,
    headRunMedianRangeMs: spread(rows.map(row => row.metrics.head.median)),
    oldRunMedianRangeMs: spread(rows.map(row => row.metrics.old.median)),
    medianRunRatio: median(rows.map(row => row.metrics.head.median / row.metrics.old.median)),
    runRatioRange: spread(rows.map(row => row.metrics.head.median / row.metrics.old.median)),
    runs: rows.map(row => ({ artifact: row.artifact, samplesArtifact: row.samplesArtifact, run: row.run,
      headMs: row.metrics.head.median, oldMs: row.metrics.old.median, correctionMs: row.subtractedEmptyMs,
      headP99Ms: row.metrics.head.p99, oldP99Ms: row.metrics.old.p99,
      gc: row.gc, observations: Object.fromEntries(Object.entries(row.observations).map(([version, value]) =>
        [version, { sha256: value.sha256, outputBytes: value.outputBytes, liveWidth: value.liveWidth }])) })) };
}

function cpu(rows) {
  return Object.fromEntries(['head', 'old'].map(version => [version, {
    sampledMeanMsPerMount: mean(rows.map(row => row.cpu[version].sampledMsPerMount)),
    phases: Object.fromEntries(Object.keys(rows[0].cpu[version].phases).map(phase => [phase, {
      meanMsPerMount: mean(rows.map(row => row.cpu[version].phases[phase].msPerMount)),
      medianRunMsPerMount: median(rows.map(row => row.cpu[version].phases[phase].msPerMount)),
      runRangeMsPerMount: spread(rows.map(row => row.cpu[version].phases[phase].msPerMount)) }])),
    runs: rows.map(row => ({ artifact: row.artifact, samplesArtifact: row.samplesArtifact, run: row.run,
      blueprintMsPerMount: row.cpu[version].phases.blueprint.msPerMount,
      sampledMsPerMount: row.cpu[version].sampledMsPerMount })) }]));
}

function allocations(rows, version) {
  const functions = new Map();
  for (const record of rows) for (const fn of record.heap[version].functions) {
    const owner = fn.owner ?? (fn.file.startsWith('packages/canard/schema-form/src/') ? fn : undefined);
    if (!owner) continue;
    const key = `${owner.function}|${owner.file}:${owner.line}`;
    const entry = functions.get(key) ?? { function: owner.function, file: owner.file, line: owner.line,
      objectsPerMount: 0, bytesPerMount: 0, blueprintObjectsPerMount: 0, restObjectsPerMount: 0 };
    entry.objectsPerMount += fn.samples / 303; entry.bytesPerMount += fn.bytes / 303;
    entry[fn.phase + 'ObjectsPerMount'] += fn.samples / 303;
    functions.set(key, entry);
  }
  const fields = ['objectsPerMount', 'blueprintObjectsPerMount', 'restObjectsPerMount', 'unknownObjectsPerMount',
    'excludedObjectsPerMount', 'bytesPerMount', 'blueprintBytesPerMount', 'restBytesPerMount', 'unknownBytesPerMount', 'excludedBytesPerMount'];
  const totals = Object.fromEntries(fields.map(field => [field, mean(rows.map(row => row.heap[version][field]))]));
  return { ...totals, objectsRunMeanRange: spread(rows.map(row => row.heap[version].objectsPerMount)),
    bytesRunMeanRange: spread(rows.map(row => row.heap[version].bytesPerMount)),
    sourceAttributedObjectsPerMount: [...functions.values()].reduce((sum, fn) => sum + fn.objectsPerMount, 0),
    top10ByObjectCount: [...functions.values()].sort((a, b) => b.objectsPerMount - a.objectsPerMount).slice(0, 10),
    runs: rows.map(row => ({ artifact: row.artifact, heapMountsArtifact: relative(path.join(artifacts,
      `objects-supp-default-${row.name}-old-w20-r${row.run}-${version}.heap-mounts.json`)),
      run: row.run, ...Object.fromEntries(fields.map(field => [field, row.heap[version][field]])) })) };
}

const fixtures = names.map(name => {
  const regimes = Object.fromEntries(['default', 'ss64'].map(regime => {
    const timer = records('supp-timer-' + regime, name), cpuRows = records('cpu-supp-' + regime, name);
    const analysisCpu = cpu(cpuRows);
    const analysisMs = analysisCpu.head.phases.blueprint.medianRunMsPerMount;
    return [regime, { mounts: clocks(timer), cpu: analysisCpu,
      sameRegimeBlueprintMs: analysisMs, hotLoopGapMs: analysisMs - hot[name],
      clockGc: Object.fromEntries(['head', 'old'].map(version => [version, {
        meanMsPerMount: mean(timer.map(row => row.gc[version].meanMs)),
        mountsWithGC: timer.reduce((sum, row) => sum + row.gc[version].mountsWithGC, 0), mounts: 303 }])) }];
  }));
  const heap = records('objects-supp-default', name);
  return { name, historicHotLoopBlueprintMs: hot[name], historicDefaultGapMs: historicGaps[name], regimes,
    allocations: Object.fromEntries(['head', 'old'].map(version => [version, allocations(heap, version)])) };
});

const editorial = [...names, 'sample-0'].map(name => {
  const forcedRows = records('editor-timer-forced', name), steadyRows = records('editor-timer-steady', name);
  for (const version of ['head', 'old']) {
    const digests = [...forcedRows, ...steadyRows].map(row => row.observations[version].sha256);
    assert(digests.every(digest => digest === digests[0]));
    if (name !== 'sample-0') {
      const previous = read(path.join(artifacts, `supp-timer-default-${name}-old-w20-r1.summary.json`));
      assert.equal(digests[0], previous.observations[version].sha256);
    }
  }
  const forced = clocks(forcedRows), steady = clocks(steadyRows);
  const headDifferenceMs = forced.headMs - steady.headMs, oldDifferenceMs = forced.oldMs - steady.oldMs;
  return { name, forced, steady, headDifferenceMs, oldDifferenceMs,
    headDifferencePercent: headDifferenceMs / forced.headMs * 100,
    oldDifferencePercent: oldDifferenceMs / forced.oldMs * 100,
    pairedRunDifferencesMs: [1, 2, 3].map((run, index) => ({ run,
      head: forcedRows[index].metrics.head.median - steadyRows[index].metrics.head.median,
      old: forcedRows[index].metrics.old.median - steadyRows[index].metrics.old.median })),
    steadyClockGc: Object.fromEntries(['head', 'old'].map(version => [version, {
      meanMsPerMount: mean(steadyRows.map(row => row.gc[version].meanMs)),
      mountsWithGC: steadyRows.reduce((sum, row) => sum + row.gc[version].mountsWithGC, 0), mounts: 303 }])) };
});

const sorted = processes.toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
for (let index = 1; index < sorted.length; index++) assert(Date.parse(sorted[index].started) >= Date.parse(sorted[index - 1].ended));
let files = 0, maxFileBytes = 0;
function sizes(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) sizes(file);
    else { const size = fs.statSync(file).size; assert(size <= 5_000_000, file); files++; maxFileBytes = Math.max(maxFileBytes, size); }
  }
}
sizes(path.join(directory, 'profile-101-gc'));
const summary = {
  head: expectedHead, generatedAt: new Date().toISOString(), sourceTree, reusedBundleSourceHead: originalHead, builds,
  method: '귀속 보강입니다. 완료된 timer 18회·CPU 18회·1-byte heap 9회는 재사용하고, 기록용 forced/steady timer 24회를 fresh paired process에서 순차 수집했습니다. 각 엔진 warmup 20 뒤 101 mount, 회차별 H/V 첫 순서 교대, validation off, subscribers 0입니다.',
  estimatorPolicy: 'mount 대표값은 회차별 보정 중앙값 3개의 중앙값, 표의 새/구 배율은 두 대표값의 비율입니다. CPU 대표 청사진 시간은 회차별 101창 평균 3개의 중앙값, 할당 count/bytes는 303창 산술 평균입니다. run 범위와 medianRunRatio를 별도 보존합니다.',
  objectCountMethod: 'samplingInterval=1 byte, randomness suppression, major/minor 수거 객체 포함. 표의 객체 수는 창 안 V8 allocation sample 수를 직접 셉니다. byte/평균 크기 환산이 아닙니다. 기본 allocation folding을 유지하여 합쳐진 할당 블록이 한 sample일 수 있으며 정확한 JavaScript 객체 전수 개수로 해석하지 않습니다.',
  allocationAttribution: '가장 가까운 제품 source 함수로 native leaf의 자기 할당을 귀속하고 function|file:line으로 합산한 뒤 count 내림차순 상위 10개를 기록합니다. source line은 함수 진입 위치입니다. 창 밖 inspector/clone 할당은 제외하고 위치미상 count/bytes는 총량에 포함합니다.',
  editorialMethod: 'fresh paired process, warmup 20쌍 뒤 101 연속쌍×3. 95C-01 OFF의 64 microtask checkpoint 뒤 단일 setImmediate sentinel 내부 clock으로 종단을 잡고, 전후 empty 각 101개의 pooled nearest-rank median C를 두 엔진에 공통으로 뺍니다. schema clone과 forced GC 및 GC 뒤 check anchor는 clock 밖입니다. steady의 warmup·101 measured쌍 사이에는 명시적 GC·profiler가 없습니다. 동일 sentinel/correction/anchor 조건의 forced 대응열도 새로 수집했습니다.',
  differenceInterpretation: '기록용 재컴파일 몫은 forced 대표 mount−steady 대표 mount로 정의한 GC 조건 전환의 관측 순차이입니다. steady 창 안 자연 GC 및 heap/JIT 상태 차이가 포함되므로 순수 재컴파일 CPU 시간이나 제품 최적화 이득으로 단정하지 않습니다.',
  officialVerdict: { requirement: 'TEST-026', forcedCollectionRetained: true, changed: false,
    note: 'steady 열은 기록용이며 기존 공식 forced-GC 판정에 섞지 않습니다.' },
  excludedArtifactPrefixes: ['objects-supp-nofold', 'trace-supp'],
  fixtures, editorial,
  verification: { completedFreshWorkers: processes.length, reusedWorkers: 45, additionalWorkers: 24,
    measuredWindows: processes.length * 202, sequential: true, allExitedNaturally: true,
    maximumCommandMs: Math.max(...processes.map(record => record.elapsedMs)), sourceDiffEmpty: true,
    sourceTreesIdentical: true, bundleHashesMatch: true, sampleLengthsAndConservationChecked: true,
    editorOutputDigestsMatch: true, inspectedFiles: files, maximumFileBytes: maxFileBytes,
    adapterSetupPilot: '초기 adapter의 script anchor 중복 assertion은 measured window 시작 전 자연 exit 1이었습니다. anchor를 줄 경계로 한정한 뒤 성공한 전체 회차만 사용했습니다.' },
  processes
};
assert(Buffer.byteLength(JSON.stringify(summary)) <= 5_000_000);
console.log(JSON.stringify(summary));
