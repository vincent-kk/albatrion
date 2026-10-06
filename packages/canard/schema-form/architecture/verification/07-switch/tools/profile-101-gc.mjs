// CLI-only attribution: adapts the committed paired harness in memory; source files are never written.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import inspector from 'node:inspector';
import { createRequire } from 'node:module';
import path from 'node:path';
import { PerformanceObserver, constants, performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { getHeapStatistics } from 'node:v8';

const script = fileURLToPath(import.meta.url);
const directory = path.resolve(path.dirname(script), '..');
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const artifacts = path.join(directory, 'profile-101-gc');
const bundles = path.join(artifacts, 'bundles');
const raw = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/prof';
const head = 'aee63933e43e3f8da442cf3ba7e7574f2aa16679';
const require = createRequire(path.join(repo, 'package.json'));
const { TraceMap, originalPositionFor } = require('@jridgewell/trace-mapping');
const names = ['nested-d5-f4', 'flat-500', 'oneOf-20'];
const samplingInterval = 2048;
const clockUs = () => Number(process.hrtime.bigint() / 1000n);
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);

function replaceOnce(source, before, after) {
  assert.equal(source.split(before).length, 2, `Unique adapter anchor: ${before.slice(0, 100)}`);
  return source.replace(before, after);
}

function save(file, value) {
  const serialized = JSON.stringify(value) + '\n';
  assert(Buffer.byteLength(serialized) <= 5_000_000, `Five-MB cap: ${file}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, serialized);
}

// The committed timer's fixture construction, drain, create, metrics, and production builder are canonical.
let source = fs.readFileSync(path.join(directory, 'tools/profile-99c01.mjs'), 'utf8');
source = source.slice(0, source.indexOf('const [command, ...args] = process.argv.slice(2);'));
source = replaceOnce(source, 'const script = fileURLToPath(import.meta.url);', `const script = ${JSON.stringify(script)};`);
source = replaceOnce(source, "const work = path.join(output, '.profile-99c01-work');", `const work = ${JSON.stringify(bundles)};`);
source = replaceOnce(source, "const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';", `const head = ${JSON.stringify(head)};`);
source = replaceOnce(source, "  const edits = variant === 'head' || variant === 'old' ? [] :\n    JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8')).find(item => item.id === variant)?.edits;",
  `  const edits = ['head', 'old', 'control'].includes(variant) ? [] :\n    JSON.parse(fs.readFileSync(${JSON.stringify(path.join(artifacts, 'ablations.json'))}, 'utf8')).find(item => item.id === variant)?.edits;`);
source = replaceOnce(source, ': edit.body;', ': edit.body.replaceAll("__ORIGINAL_BODY__", originalBody);');
source += '\nexport { buildAsync, fixtureFor, drain, create, observe, metric, environment };\n';
const canonical = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const { buildAsync, fixtureFor, drain, create, observe, metric, environment } = canonical;
const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const median = values => metric(values).median;

async function measureMount(operation) {
  const beginUs = clockUs();
  const beginMs = performance.now();
  const result = operation();
  await drain();
  const endMs = performance.now();
  const endUs = clockUs();
  return { result, ms: endMs - beginMs, beginMs, endMs, beginUs, endUs };
}

function gcRows(entries, windows) {
  return windows.map(window => {
    const parts = { scavengeMs: 0, majorMs: 0, incrementalMs: 0, weakCallbackMs: 0, otherMs: 0 };
    let events = 0;
    for (const entry of entries) {
      const overlap = Math.max(0, Math.min(window.endMs, entry.startTime + entry.duration) - Math.max(window.beginMs, entry.startTime));
      if (!overlap) continue;
      const key = entry.kind === constants.NODE_PERFORMANCE_GC_MINOR ? 'scavengeMs' :
        entry.kind === constants.NODE_PERFORMANCE_GC_MAJOR ? 'majorMs' :
        entry.kind === constants.NODE_PERFORMANCE_GC_INCREMENTAL ? 'incrementalMs' :
        entry.kind === constants.NODE_PERFORMANCE_GC_WEAKCB ? 'weakCallbackMs' : 'otherMs';
      parts[key] += overlap;
      events++;
    }
    return { ...parts, totalMs: Object.values(parts).reduce((sum, value) => sum + value, 0), events };
  });
}

function gcSummary(rows) {
  return { mounts: rows.length, meanMs: average(rows.map(row => row.totalMs)), medianMs: median(rows.map(row => row.totalMs)),
    scavengeMeanMs: average(rows.map(row => row.scavengeMs)), majorMeanMs: average(rows.map(row => row.majorMs)),
    incrementalMeanMs: average(rows.map(row => row.incrementalMs)), weakCallbackMeanMs: average(rows.map(row => row.weakCallbackMs)),
    frequency: rows.filter(row => row.events).length / rows.length, mountsWithGC: rows.filter(row => row.events).length,
    events: rows.reduce((sum, row) => sum + row.events, 0) };
}

function mappedFrame(frame, maps) {
  let file = frame.url || '(V8)', line = frame.lineNumber + 1, column = frame.columnNumber;
  const variant = Object.keys(maps).find(version => file.endsWith(`/${version}.cjs`));
  if (variant && line > 0) {
    const original = originalPositionFor(maps[variant], { line, column: Math.max(column, 0) });
    if (original.source) {
      file = path.relative(repo, path.resolve(bundles, original.source));
      line = original.line; column = original.column;
    }
  } else if (file.startsWith('file://')) file = path.relative(repo, fileURLToPath(file));
  else if (file.startsWith(repo)) file = path.relative(repo, file);
  if (file.startsWith('data:')) file = '(canonical paired harness)';
  return { function: frame.functionName || '(anonymous)', file, line, column };
}

function mapsFor(versions) {
  return Object.fromEntries(versions.map(version => [version, new TraceMap(JSON.parse(fs.readFileSync(path.join(bundles, `${version}.cjs.map`), 'utf8')))]));
}

function cpuAttribution(profile, windows, versions, warmup) {
  const maps = mapsFor(versions), nodes = new Map(profile.nodes.map(node => [node.id, node]));
  const parents = new Map();
  for (const node of profile.nodes) for (const id of node.children ?? []) parents.set(id, node.id);
  const stacks = new Map();
  for (const node of profile.nodes) {
    const stack = [];
    for (let id = node.id; id !== undefined; id = parents.get(id)) stack.push(mappedFrame(nodes.get(id).callFrame, maps));
    stacks.set(node.id, stack);
  }
  const results = {};
  for (const version of versions) {
    const selected = windows.filter(window => window.version === version);
    const rows = new Map();
    const phases = { blueprint: 0, rest: 0, garbageCollector: 0, program: 0, idle: 0, driver: 0 };
    let timestamp = profile.startTime, cursor = 0, samples = 0, denominatorUs = 0;
    for (let index = 0; index < profile.samples.length; index++) {
      const delta = profile.timeDeltas[index];
      timestamp += delta;
      while (cursor < selected.length && timestamp > selected[cursor].endUs) cursor++;
      if (cursor >= selected.length) break;
      const window = selected[cursor];
      if (timestamp < window.beginUs) continue;
      // Clip the preceding sampling interval to the clocked window; include GC/program/idle unconditionally.
      const weight = Math.max(0, Math.min(timestamp, window.endUs) - Math.max(timestamp - delta, window.beginUs));
      const stack = stacks.get(profile.samples[index]), leaf = stack[0];
      denominatorUs += weight; samples++;
      const blueprint = stack.some(frame => frame.function === 'blueprint' && frame.file.endsWith('/blueprint/blueprint.ts'));
      const engine = stack.some(frame => frame.file.startsWith('packages/canard/schema-form/src/'));
      const phase = leaf.function === '(garbage collector)' ? 'garbageCollector' : leaf.function === '(program)' ? 'program' :
        leaf.function === '(idle)' ? 'idle' : blueprint ? 'blueprint' : engine ? 'rest' : 'driver';
      phases[phase] += weight;
      const seen = [];
      for (let position = 0; position < stack.length; position++) {
        const frame = stack[position], key = `${frame.function}|${frame.file}:${frame.line}`;
        if (seen.includes(key)) continue;
        seen.push(key);
        if (!rows.has(key)) rows.set(key, { ...frame, selfUs: 0, inclusiveUs: 0, selfSamples: 0, selfPhaseUs: {} });
        const row = rows.get(key);
        row.inclusiveUs += weight;
        if (!position) { row.selfUs += weight; row.selfSamples++;
          row.selfPhaseUs[phase] = (row.selfPhaseUs[phase] ?? 0) + weight; }
      }
    }
    results[version] = { warmup, mounts: selected.length, samples, denominatorMs: denominatorUs / 1000,
      sampledMsPerMount: denominatorUs / 1000 / selected.length,
      phases: Object.fromEntries(Object.entries(phases).map(([phase, us]) => [phase, { msPerMount: us / 1000 / selected.length, percent: us / denominatorUs * 100 }])),
      functions: [...rows.values()].filter(row => row.selfUs || row.inclusiveUs).map(row => ({ ...row,
        selfMsPerMount: row.selfUs / 1000 / selected.length, inclusiveMsPerMount: row.inclusiveUs / 1000 / selected.length,
        selfPhaseMsPerMount: Object.fromEntries(Object.entries(row.selfPhaseUs).map(([phase, us]) => [phase, us / 1000 / selected.length])),
        selfPercent: row.selfUs / denominatorUs * 100, inclusivePercent: row.inclusiveUs / denominatorUs * 100 })).sort((a, b) => b.selfUs - a.selfUs) };
  }
  return results;
}

function heapAttribution(profile, maps) {
  const nodes = new Map(), stacks = new Map();
  function visit(node, ancestors) {
    const stack = [mappedFrame(node.callFrame, maps), ...ancestors];
    nodes.set(node.id, node); stacks.set(node.id, stack);
    for (const child of node.children ?? []) visit(child, stack);
  }
  visit(profile.head, []);
  const functions = new Map();
  let blueprintBytes = 0, restBytes = 0, unknownBytes = 0, unknownSamples = 0, excludedBytes = 0, totalSampleBytes = 0;
  for (const sample of profile.samples) {
    totalSampleBytes += sample.size;
    const stack = stacks.get(sample.nodeId);
    // stopSampling can append a final ordinal whose node was not serialized; retain its bytes explicitly.
    if (!stack) { unknownBytes += sample.size; unknownSamples++; continue; }
    const leaf = stack[0];
    const engine = stack.some(frame => frame.file.startsWith('packages/canard/schema-form/src/'));
    const timedDriver = stack.some(frame => frame.function === 'measureMount' || frame.function === 'drain');
    if (!engine && !timedDriver) { excludedBytes += sample.size; continue; }
    const blueprint = stack.some(frame => frame.function === 'blueprint' && frame.file.endsWith('/blueprint/blueprint.ts'));
    if (blueprint) blueprintBytes += sample.size; else restBytes += sample.size;
    // V8 may report a native leaf; preserve it and its closest source caller rather than inventing an exact object line.
    const owner = stack.find(frame => frame.file.startsWith('packages/canard/schema-form/src/'));
    const key = `${leaf.function}|${leaf.file}:${leaf.line}|${blueprint ? 'blueprint' : 'rest'}|${owner?.file}:${owner?.line}`;
    if (!functions.has(key)) functions.set(key, { ...leaf, phase: blueprint ? 'blueprint' : 'rest', owner, bytes: 0, samples: 0 });
    const row = functions.get(key); row.bytes += sample.size; row.samples++;
  }
  return { bytes: blueprintBytes + restBytes + unknownBytes, blueprintBytes, restBytes, unknownBytes, unknownSamples, excludedBytes, totalSampleBytes,
    sampledAllocations: profile.samples.length, functions: [...functions.values()].sort((a, b) => b.bytes - a.bytes) };
}

async function paired(variant, name, run, mode, warmup) {
  assert(globalThis.gc, '--expose-gc is required');
  // Diagnostic only: keep frozen-array representation maps alive across forced collections without changing either engine.
  if (mode === 'cpu-retain-frozen-types') globalThis.__typeShapes101 = [
    Object.freeze(['string']), Object.freeze(new Array(1).fill('string')),
    Object.freeze(Array.from(new Set(['string']))), Object.freeze([0]), Object.freeze([]), Object.freeze([{}]) ];
  const versions = ['head', variant];
  const apis = Object.fromEntries(versions.map(version => [version, require(path.join(bundles, `${version}.cjs`))]));
  const fixtures = Object.fromEntries(versions.map(version => [version, fixtureFor(apis[version], name)]));
  const data = Object.fromEntries(versions.map(version => [version, []]));
  const heaps = Object.fromEntries(versions.map(version => [version, []]));
  const memory = Object.fromEntries(versions.map(version => [version, []]));
  const lastRoots = {}, windows = [], events = [], deltas = [], emptyBefore = [], emptyAfter = [];
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) events.push({ startTime: entry.startTime, duration: entry.duration,
      kind: entry.detail.kind, flags: entry.detail.flags });
  });
  observer.observe({ entryTypes: ['gc'] });
  const cpu = mode.startsWith('cpu');
  const forcedGC = mode !== 'cpu-no-forced-gc' && mode !== 'trace-no-forced-gc';
  const session = cpu || mode === 'heap' ? new inspector.Session() : undefined;
  session?.connect();
  const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params, (error, result) => error ? reject(error) : resolve(result)));
  if (cpu) { await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 100 }); }
  if (mode === 'heap') await post('HeapProfiler.enable');
  const maps = mode === 'heap' ? mapsFor(versions) : undefined;
  for (let index = 0; index < 101; index++) emptyBefore.push((await measureMount(() => {})).ms);
  const started = new Date().toISOString();
  let cpuProfile;
  for (let index = -warmup; index < 101; index++) {
    if (index === 0 && mode.startsWith('trace')) console.log('101_MEASURE_BEGIN');
    if (index === 0 && cpu) await post('Profiler.start');
    const pair = {};
    const order = index % 2 === (run % 2 ? 0 : 1) ? versions : [...versions].reverse();
    for (const version of order) {
      const schema = structuredClone(version === 'old' ? fixtures[version].legacy : fixtures[version].workspace);
      globalThis.__profile99SequenceCursors = {};
      if (forcedGC) globalThis.gc();
      if (index >= 0 && mode === 'heap') await post('HeapProfiler.startSampling', {
        samplingInterval, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
      globalThis.__profile99Ablating = version !== 'head' && version !== 'old' && version !== 'control';
      if (index >= 0 && mode.startsWith('trace')) console.log(`101_MOUNT_BEGIN ${version} ${index}`);
      const heapBefore = mode === 'memory' ? getHeapStatistics().used_heap_size : undefined;
      const sample = await measureMount(() => create(apis[version], fixtures[version], version, schema));
      const heapAfter = mode === 'memory' ? getHeapStatistics().used_heap_size : undefined;
      if (index >= 0 && mode.startsWith('trace')) console.log(`101_MOUNT_END ${version} ${index}`);
      globalThis.__profile99Ablating = false;
      pair[version] = sample.ms; lastRoots[version] = sample.result;
      if (index >= 0) {
        data[version].push(sample.ms);
        windows.push({ version, index, beginMs: sample.beginMs, endMs: sample.endMs, beginUs: sample.beginUs, endUs: sample.endUs });
        if (mode === 'memory') memory[version].push({ heapBefore, heapAfter, deltaBytes: heapAfter - heapBefore });
      }
      if (index >= 0 && mode === 'heap') {
        const { profile } = await post('HeapProfiler.stopSampling');
        const file = path.join(raw, `101-heap-${name}-${version}-vs-${variant}-r${run}-s${String(index).padStart(3, '0')}.heapprofile`);
        save(file, profile);
        heaps[version].push({ sample: index, rawProfile: file, ...heapAttribution(profile, maps) });
      }
    }
    if (index >= 0) deltas.push(pair.head - pair[variant]);
  }
  if (mode.startsWith('trace')) console.log('101_MEASURE_END');
  if (cpu) cpuProfile = (await post('Profiler.stop')).profile;
  for (let index = 0; index < 101; index++) emptyAfter.push((await measureMount(() => {})).ms);
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
  observer.disconnect(); session?.disconnect();
  const empty = (metric(emptyBefore).median + metric(emptyAfter).median) / 2;
  const metrics = Object.fromEntries(versions.map(version => [version, metric(data[version].map(value => value - empty))]));
  const gc = Object.fromEntries(versions.map(version => [version, gcRows(events, windows.filter(window => window.version === version))]));
  const summary = { head, variant, name, run, mode, warmup, forcedGC, samples: 101, started, ended: new Date().toISOString(),
    environment: environment(), emptyBefore: metric(emptyBefore), emptyAfter: metric(emptyAfter), subtractedEmptyMs: empty,
    metrics, meanMs: Object.fromEntries(versions.map(version => [version, average(data[version]) - empty])),
    boundMs: metrics.head.median - metrics[variant].median, pairedDelta: metric(deltas),
    pairedMedianIntervalMs: [deltas.toSorted((a, b) => a - b)[40], deltas.toSorted((a, b) => a - b)[60]],
    gc: Object.fromEntries(versions.map(version => [version, gcSummary(gc[version])])),
    observations: Object.fromEntries(versions.map(version => [version, observe(lastRoots[version])])),
    unclockedGcCount: events.filter(event => !windows.some(window => event.startTime >= window.beginMs && event.startTime < window.endMs)).length };
  const tag = `${mode}-${name}-${variant}-w${warmup}-r${run}`;
  if (mode === 'memory') summary.heapUsedDelta = Object.fromEntries(versions.map(version => [version, {
    meanBytes: average(memory[version].map(mount => mount.deltaBytes)), metrics: metric(memory[version].map(mount => mount.deltaBytes)),
    exactNoCollectionWindows: gc[version].every(mount => mount.events === 0), mounts: memory[version] }]));
  if (cpu) {
    const file = path.join(raw, `101-${tag}.cpuprofile`);
    save(file, cpuProfile); summary.rawProfile = file;
    summary.cpu = cpuAttribution(cpuProfile, windows, versions, warmup);
  }
  if (mode === 'heap') {
    summary.samplingIntervalBytes = samplingInterval;
    summary.heap = {};
    for (const version of versions) {
      const functions = new Map();
      for (const mount of heaps[version]) for (const row of mount.functions) {
        const key = `${row.function}|${row.file}:${row.line}|${row.phase}|${row.owner?.file}:${row.owner?.line}`;
        if (!functions.has(key)) functions.set(key, { ...row, bytes: 0, samples: 0 });
        const held = functions.get(key); held.bytes += row.bytes; held.samples += row.samples;
      }
      summary.heap[version] = { bytesPerMount: average(heaps[version].map(mount => mount.bytes)),
        blueprintBytesPerMount: average(heaps[version].map(mount => mount.blueprintBytes)),
        restBytesPerMount: average(heaps[version].map(mount => mount.restBytes)),
        unknownBytesPerMount: average(heaps[version].map(mount => mount.unknownBytes)),
        unknownSamples: heaps[version].reduce((sum, mount) => sum + mount.unknownSamples, 0),
        excludedBytesPerMount: average(heaps[version].map(mount => mount.excludedBytes)),
        metrics: metric(heaps[version].map(mount => mount.bytes)),
        functions: [...functions.values()].map(row => ({ ...row, bytesPerMount: row.bytes / 101,
          percent: row.bytes / heaps[version].reduce((sum, mount) => sum + mount.bytes, 0) * 100 })).sort((a, b) => b.bytes - a.bytes) };
    }
    for (const version of versions) save(path.join(artifacts, `${tag}-${version}.heap-mounts.json`),
      heaps[version].map(({ functions, ...mount }) => mount));
  }
  save(path.join(artifacts, `${tag}.samples.json`), { timingsMs: data, pairedDeltasMs: deltas, windows, gc, gcEntries: events });
  save(path.join(artifacts, `${tag}.summary.json`), summary);
  console.log(JSON.stringify({ tag, headMs: metrics.head.median, variantMs: metrics[variant].median,
    boundMs: summary.boundMs, gcMeanMs: Object.fromEntries(versions.map(version => [version, summary.gc[version].meanMs])),
    heapBytes: mode === 'heap' ? Object.fromEntries(versions.map(version => [version, summary.heap[version].bytesPerMount])) : undefined,
    blueprintCpuMs: cpu ? Object.fromEntries(versions.map(version => [version, summary.cpu[version].phases.blueprint.msPerMount])) : undefined }));
}

function child(args) {
  const result = spawnSync(process.execPath, args, { cwd: repo, env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' },
    encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  if (args.includes('--trace-gc')) {
    const start = result.stdout.indexOf('101_MEASURE_BEGIN'), end = result.stdout.indexOf('101_MEASURE_END');
    const measured = result.stdout.slice(start, end);
    const name = args.at(-4), run = args.at(-3), warmup = args.at(-1);
    const traceMode = args.at(-2);
    const file = path.join(artifacts, `${traceMode}-${name}-w${warmup}-r${run}.log`);
    assert(Buffer.byteLength(result.stdout) <= 5_000_000);
    fs.writeFileSync(file, result.stdout);
    const clockedCollections = [];
    let current;
    for (const line of measured.split('\n')) {
      if (line.startsWith('101_MOUNT_BEGIN ')) current = line;
      else if (line.startsWith('101_MOUNT_END ')) current = undefined;
      else if (current && /Scavenge|Mark-Compact|Mark-sweep|Minor Mark-Sweep/.test(line)) clockedCollections.push({ mount: current, line });
    }
    const trace = { file, measuredOptimizationLines: measured.split('\n').filter(line => /optimizing|compiling|bailout|marking.*optimization/.test(line)),
      allOptimizationLines: result.stdout.split('\n').filter(line => /optimizing|compiling|bailout|marking.*optimization/.test(line)),
      clockedCollections, allCollections: result.stdout.split('\n').filter(line => /Scavenge|Mark-Compact|Mark-sweep|Minor Mark-Sweep/.test(line)).length };
    save(file.replace(/\.log$/, '.summary.json'), trace);
    console.log(JSON.stringify({ name, run, warmup, allGC: trace.allCollections, clockedGC: clockedCollections.length,
      measuredOptimizationLines: trace.measuredOptimizationLines.length }));
  } else console.log(result.stdout.trim());
}

const [command, ...args] = process.argv.slice(2);
if (command === '--build') {
  for (const variant of args.length ? args : ['head', 'control', 'old']) child([script, '--build-worker', variant]);
} else if (command === '--build-worker') {
  const record = await buildAsync(args[0]);
  save(path.join(artifacts, `build-${args[0]}.summary.json`), record);
  console.log(JSON.stringify({ variant: record.variant, bytes: record.bytes, sha256: record.sha256,
    naturalServiceExits: record.naturalServiceExits }));
} else if (command === '--worker') {
  await paired(args[0], args[1], Number(args[2]), args[3], Number(args[4] ?? 20));
} else if (command === '--phase') {
  const [mode, variant = 'old', warmup = '20', repetitions = '3'] = args;
  for (const name of names) for (let run = 1; run <= Number(repetitions); run++)
    child(['--expose-gc', script, '--worker', variant, name, String(run), mode, warmup]);
} else if (command === '--trace-phase') {
  const [warmup = '20', repetitions = '3', mode = 'trace'] = args;
  for (const name of names) for (let run = 1; run <= Number(repetitions); run++)
    child(['--expose-gc', '--trace-gc', '--trace-opt', '--trace-deopt', '--trace-file-names', script,
      '--worker', 'old', name, String(run), mode, warmup]);
} else if (command === '--bounds') {
  for (const variant of args) for (const name of names) for (let run = 1; run <= 3; run++)
    child(['--expose-gc', script, '--worker', variant, name, String(run), 'timer', '20']);
} else if (command === '--heap-audit') {
  for (const variant of args)
    child(['--expose-gc', script, '--worker', variant, 'nested-d5-f4', '1', 'heap', '20']);
} else if (command === '--recompute-cpu') {
  let count = 0;
  for (const file of fs.readdirSync(artifacts).filter(file => file.startsWith('cpu') && file.endsWith('.summary.json'))) {
    const target = path.join(artifacts, file), summary = JSON.parse(fs.readFileSync(target, 'utf8'));
    const samples = JSON.parse(fs.readFileSync(target.replace('.summary.json', '.samples.json'), 'utf8'));
    const profile = JSON.parse(fs.readFileSync(summary.rawProfile, 'utf8'));
    summary.cpu = cpuAttribution(profile, samples.windows, ['head', summary.variant], summary.warmup);
    save(target, summary); count++;
  }
  console.log(JSON.stringify({ recomputedCpuProfiles: count, clockWindowsUnchanged: true }));
} else {
  throw new Error('Use --build, --build-worker, --worker, or --phase');
}
