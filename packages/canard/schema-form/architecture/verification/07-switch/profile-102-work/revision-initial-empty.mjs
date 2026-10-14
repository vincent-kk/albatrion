// Invoked explicitly for round 102; canonical production builder and sentinel clocks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { performance, PerformanceObserver } from 'node:perf_hooks';
import { createHash } from 'node:crypto';

const script = fileURLToPath(import.meta.url);
const artifacts = path.dirname(script), directory = path.dirname(artifacts);
const pkg = path.resolve(directory, '../../..'), repo = path.resolve(pkg, '../../..');
const head = '2333fd5af';
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const require = createRequire(path.join(repo, 'package.json'));
process.env.NODE_PATH = path.join(repo, 'node_modules');
require('node:module').Module._initPaths();
const started = Date.now();
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'rev-parse', '--short=9', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);
const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'],
  ['sample-0', 'mount'], ['sample-0', 'first'], ['sample-0', 'later'],
  ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later']];

/** Enforce a unique canonical adapter anchor before applying a memory substitution. */
function once(source, before, after) {
  assert.equal(source.split(before).length, 2, before);
  return source.replace(before, after);
}

/** Persist bounded evidence within the requested measurement directory. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(artifacts, 'revision102-' + name + '.json'), text);
}

let canonical = fs.readFileSync(path.join(directory, 'tools/profile-99c01.mjs'), 'utf8');
canonical = canonical.slice(0, canonical.indexOf('const [command, ...args] = process.argv.slice(2);'));
canonical = once(canonical, 'const script = fileURLToPath(import.meta.url);',
  'const script = ' + JSON.stringify(path.join(directory, 'tools/profile-99c01.mjs')) + ';');
canonical = once(canonical, "const work = path.join(output, '.profile-99c01-work');", 'const work = ' + JSON.stringify(bundles) + ';');
canonical = once(canonical, "const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';", 'const head = ' + JSON.stringify(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim()) + ';');
canonical = once(canonical, "  const edits = variant === 'head' || variant === 'old' ? [] :\n    JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8')).find(item => item.id === variant)?.edits;", '  const edits = [];');
canonical = once(canonical, "ablateSource(file, fs.readFileSync(file, 'utf8'), edits)", "globalThis.__revision102Source(file, fs.readFileSync(file, 'utf8'), variant)");
canonical = once(canonical, 'outfile: path.join(work, `${variant}.cjs`)', 'outfile: path.join(work, `revision102-${variant}.cjs`)');
canonical += '\nexport { buildAsync, fixtureFor, create, observe, environment };\n';
globalThis.__revision102Source = (file, content, variant) => {
  const relative = path.relative(repo, file);
  let source = variant.startsWith('working') ? content : execFileSync('git',
    ['--no-optional-locks', '-c', 'core.fsmonitor=false', 'show', head + ':' + relative],
    { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
  if (variant.endsWith('-count') && relative.endsWith('/record/type.ts'))
    source = once(source, 'Object.freeze({});', `new Proxy(Object.freeze({}), {
      get(target, key, receiver) {
        if (typeof key === 'string' && /^\\d+$/.test(key)) globalThis.__revision102Reads++;
        return Reflect.get(target, key, receiver);
      }
    });`);
  return source;
};
const api = await import('data:text/javascript;base64,' + Buffer.from(canonical).toString('base64'));
const bundle = variant => path.join(bundles, `revision102-${variant}.cjs`);

/** Record the endpoint inside one check sentinel after 64 Promise checkpoints. */
async function measured(operation) {
  const begin = performance.now(), root = operation();
  for (let index = 0; index < 64; index++) await Promise.resolve();
  const end = await new Promise(resolve => setImmediate(() => resolve(performance.now())));
  return { root, begin, end, ms: end - begin };
}

/** Use the same nearest-rank median as 95C-01. */
function median(values) {
  return values.toSorted((left, right) => left - right)[Math.ceil(values.length / 2) - 1];
}

/** Observe each public bit and mixed-mask sum outside every measurement clock. */
function observe(root) {
  const pending = [root], nodes = [];
  while (pending.length) {
    const node = pending.pop(), bits = [], sums = [];
    for (let index = 0; index < 17; index++) {
      bits.push(node.revisionLedger[1 << index] ?? null);
      sums.push(node.revision((1 << index) | 5));
    }
    assert.equal(node.value, node.value);
    nodes.push({ path: node.path, bits, sums, all: node.revision(-1), zero: node.revision(0) });
    for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--)
      if (node.children[index].parent === node) pending.push(node.children[index]);
  }
  return { ...api.observe(root), nodes, commits: root.runtime.commitNumber };
}

/** Warm retained update trees through the fixture's recorded interaction history. */
async function prepare(engine, fixture) {
  const root = api.create(engine, fixture, 'head');
  await measured(() => {});
  for (const interaction of fixture.interactions) {
    root.find(interaction.path).setValue(interaction.value);
    await measured(() => {});
  }
  return root;
}

/** Fresh process; forced pairs alternate, recorded steady column uses contiguous blocks. */
async function paired(variant, name, mode, run, regime) {
  const engines = { head: require(bundle('head')), variant: require(bundle(variant)) };
  const fixture = api.fixtureFor(engines.head, name), input = fixture.interactions[0].value;
  const values = typeof input === 'string' ? [input + '-later', input + '-again'] :
    typeof input === 'number' ? [input + 1, input] : [!input, input];
  const roots = mode === 'later' ? { head: await prepare(engines.head, fixture),
    variant: await prepare(engines.variant, fixture) } : {};
  const targets = mode === 'later' ? { head: roots.head.find(fixture.interactions[0].path),
    variant: roots.variant.find(fixture.interactions[0].path) } : {};
  const timings = { head: [], variant: [] }, last = {}, calls = { head: 0, variant: 0 };
  const before = [], after = [], windows = [], gc = [];
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) gc.push({ start: entry.startTime, ms: entry.duration, kind: entry.detail.kind });
  });
  observer.observe({ entryTypes: ['gc'] });
  for (let index = 0; index < 101; index++) before.push((await measured(() => {})).ms);
  const sample = async (version, index) => {
    assert(Date.now() - started < 420_000, 'Split before eight minutes');
    const schema = mode === 'mount' || mode === 'first' ? structuredClone(fixture.workspace) : undefined;
    if (mode === 'first') {
      roots[version] = api.create(engines[version], fixture, 'head', schema);
      await measured(() => {});
      targets[version] = roots[version].find(fixture.interactions[0].path);
      assert(targets[version]);
    }
    if (regime === 'forced') { globalThis.gc(); await new Promise(resolve => setImmediate(resolve)); }
    const result = await measured(() => mode === 'mount' ? api.create(engines[version], fixture, 'head', schema) :
      targets[version].setValue(mode === 'first' ? input : values[(index + 20) % 2]));
    calls[version]++;
    last[version] = mode === 'mount' ? result.root : roots[version];
    if (index >= 0) { timings[version].push(result.ms); windows.push({ version, index, begin: result.begin, end: result.end }); }
  };
  if (regime === 'forced') {
    assert(globalThis.gc);
    for (let index = -20; index < 101; index++)
      for (const version of (index + run - 1) % 2 === 0 ? ['head', 'variant'] : ['variant', 'head']) await sample(version, index);
  } else {
    for (const version of run % 2 ? ['head', 'variant'] : ['variant', 'head'])
      for (let index = -20; index < 101; index++) await sample(version, index);
  }
  for (let index = 0; index < 101; index++) after.push((await measured(() => {})).ms);
  await new Promise(resolve => setImmediate(resolve));
  observer.disconnect();
  assert.equal(calls.head, 121); assert.equal(calls.variant, 121);
  const observation = { head: observe(last.head), variant: observe(last.variant) };
  assert.deepEqual(observation.head, observation.variant);
  const empty = median([...before, ...after]);
  const headMs = median(timings.head) - empty, workingMs = median(timings.variant) - empty;
  const deltas = timings.head.map((value, index) => value - timings.variant[index]);
  const row = { head, variant, name, mode, run, regime, freshProcess: true, warmup: 20, samples: 101,
    calls, headMs, workingMs, gainMs: headMs - workingMs, pairedMedianMs: median(deltas),
    pairing: regime === 'forced' ? 'alternating H/W pairs' : 'ordinal comparison of contiguous H/W blocks',
    empty, timingsMs: timings, pairedDeltasMs: deltas, emptyTimingsMs: { before, after }, windows, gc,
    observation, environment: api.environment(), started, ended: Date.now(), elapsedMs: Date.now() - started };
  save(`${variant}-${name}-${mode}-${regime}-r${run}`, row);
  console.log(JSON.stringify({ variant, name, mode, run, regime, headMs, workingMs,
    gainMs: row.gainMs, pairedMedianMs: row.pairedMedianMs, seconds: row.elapsedMs / 1000 }));
}

/** Deterministic ordinary bootstrap median uncertainty matches the recorded noise rule. */
function medianError(values) {
  let state = 101;
  const medians = [];
  for (let trial = 0; trial < 1999; trial++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      sample.push(values[(state >>> 0) % values.length]);
    }
    medians.push(median(sample));
  }
  medians.sort((left, right) => left - right);
  const center = median(values);
  return Math.max(Math.abs(medians[9] - center), Math.abs(medians[1989] - center));
}

/** Compare every column against its no-op control and retain all per-run decisions. */
function summarize() {
  const rows = [], processWindows = [];
  for (const [name, mode] of operations) for (const regime of ['forced', 'steady']) {
    const read = (variant, run) => JSON.parse(fs.readFileSync(path.join(artifacts,
      `revision102-${variant}-${name}-${mode}-${regime}-r${run}.json`), 'utf8'));
    const controls = [1, 2, 3].map(run => read('control', run));
    const working = [1, 2, 3].map(run => read('working', run));
    const noOpNoiseMs = Math.max(...controls.flatMap(row => [Math.abs(row.gainMs), Math.abs(row.pairedMedianMs)]));
    const measurements = working.map(row => {
      const residuals = [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after]
        .map(value => Math.abs(value - row.empty)).toSorted((a, b) => a - b);
      const error = medianError(row.timingsMs.head) + medianError(row.timingsMs.variant);
      const noiseMs = Math.max(.001, noOpNoiseMs, residuals[Math.ceil(residuals.length * .95) - 1] + error);
      const deltas = row.pairedDeltasMs.toSorted((a, b) => a - b);
      const inside = row.gc.filter(event => row.windows.some(window => event.start >= window.begin && event.start < window.end));
      if (regime === 'forced') assert.equal(inside.filter(event => event.kind === 4).length, 0);
      return { run: row.run, headMs: row.headMs, workingMs: row.workingMs, gainMs: row.gainMs,
        pairedMedianMs: row.pairedMedianMs, noiseMs, pairedMedianInterval: [deltas[40], deltas[60]], gcInside: inside.length };
    });
    for (const row of [...controls, ...working]) processWindows.push([row.started, row.ended]);
    rows.push({ name, mode, regime, headMs: median(working.map(row => row.headMs)),
      workingMs: median(working.map(row => row.workingMs)), gainMs: median(working.map(row => row.gainMs)),
      pairedMedianMs: median(working.map(row => row.pairedMedianMs)), noOpNoiseMs,
      pooledHeadMs: median(working.flatMap(row => row.timingsMs.head.map(value => value - row.empty))),
      pooledWorkingMs: median(working.flatMap(row => row.timingsMs.variant.map(value => value - row.empty))),
      pooledPairedMedianMs: median(working.flatMap(row => row.pairedDeltasMs)),
      maxNoiseMs: Math.max(...measurements.map(row => row.noiseMs)),
      aboveNoise: measurements.every(row => row.gainMs > row.noiseMs && row.pairedMedianInterval[0] > 0),
      regressionAboveNoise: measurements.some(row => row.gainMs < -row.noiseMs && row.pairedMedianInterval[1] < 0), measurements });
  }
  processWindows.sort((a, b) => a[0] - b[0]);
  for (let index = 1; index < processWindows.length; index++) assert(processWindows[index - 1][1] <= processWindows[index][0]);
  const result = { head, adopted: rows.some(row => row.mode === 'mount' && row.aboveNoise) && rows.every(row => !row.regressionAboveNoise),
    noiseRule: 'max(1us, same-column no-op absolute median gain/paired median, empty residual p95 + 1999 bootstrap 99% median-error sum); gain requires all three runs; regression veto applies to any signed run',
    rows, workers: processWindows.length, maxWorkerMs: Math.max(...processWindows.map(([begin, end]) => end - begin)) };
  save('verdict', result);
  console.log(JSON.stringify({ ...result, rows: rows.map(({ measurements, ...row }) => row) }));
}

const [command, ...args] = process.argv.slice(2);
if (command === '--build') {
  const variant = args[0];
  assert(['head', 'working', 'control', 'head-count', 'working-count'].includes(variant));
  const record = await api.buildAsync(variant);
  save('build-' + variant, { ...record, head });
  console.log(JSON.stringify(record));
} else if (command === '--worker') {
  await paired(args[0], args[1], args[2], Number(args[3]), args[4]);
} else if (command === '--pairs') {
  for (let run = 1; run <= 3; run++) {
    assert(Date.now() - started < 360_000);
    const result = spawnSync(process.execPath, ['--expose-gc', script, '--worker', args[0], args[1], args[2], String(run), args[3]],
      { cwd: repo, env: { ...process.env, NODE_ENV: 'production', GIT_OPTIONAL_LOCKS: '0' }, encoding: 'utf8', maxBuffer: 5_000_000 });
    assert.equal(result.signal, null, result.stderr);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    console.log(result.stdout.trim());
  }
} else if (command === '--counts') {
  const rows = [];
  for (const variant of ['head-count', 'working-count']) {
    const engine = require(bundle(variant));
    for (const name of ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0']) {
      globalThis.__revision102Reads = 0;
      const fixture = api.fixtureFor(engine, name);
      const root = (await measured(() => api.create(engine, fixture, 'head', structuredClone(fixture.workspace)))).root;
      const reads = globalThis.__revision102Reads;
      const snapshot = observe(root), liveNodes = snapshot.nodes.length;
      assert.equal(reads, variant === 'head-count' ? liveNodes * 17 : 0);
      rows.push({ variant, name, liveNodes, reads, readsPerNode: reads / liveNodes, observation: snapshot });
    }
  }
  for (let index = 0; index < 4; index++) assert.deepEqual(rows[index].observation, rows[index + 4].observation);
  save('counts', { head, rows });
  console.log(JSON.stringify(rows.map(({ observation, ...row }) => row)));
} else if (command === '--summarize') summarize();
else throw new Error('Use --build, --counts, --pairs, --worker or --summarize');
assert(Date.now() - started < 480_000);
save('process-' + [command, ...args].join('_'), { args: process.argv.slice(2), started, ended: Date.now(),
  elapsedMs: Date.now() - started, naturalExit: true, status: 0, signal: null,
  driverSha256: createHash('sha256').update(fs.readFileSync(script)).digest('hex') });
