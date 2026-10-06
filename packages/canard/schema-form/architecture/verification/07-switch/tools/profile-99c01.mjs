// CLI-only measurement harness; bundles are disposable, product sources remain unchanged.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const output = path.resolve(path.dirname(script), '..');
const pkg = path.resolve(output, '../../..');
const repo = path.resolve(pkg, '../../..');
const bf = path.join(repo, 'packages/aileron/benchmark-form');
const work = path.join(output, '.profile-99c01-work');
const raw = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/prof';
const require = createRequire(path.join(repo, 'package.json'));
const { TraceMap, originalPositionFor } = require('@jridgewell/trace-mapping');
const ts = require('typescript');
const head = '4ae9dced58bcbc05c05ff5907fca463af024c7b6';
const warmup = 20;
const samples = 101;
const fixed = ['sample-0', 'nested-d5-f4', 'computed-visible-derived', 'array-100'];
const mounts = ['flat-500', 'nested-d5-f4', 'oneOf-20'];
assert.equal(fs.realpathSync(repo), '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);

/** Serialize a generated measurement, enforcing the user's decimal five-MB cap. */
function save(file, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, `Oversize measurement: ${file}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

/** Resolve only existing source files; no fallback to generated product dist. */
function resolveSource(base) {
  const found = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
    .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
  assert(found, `Missing source: ${base}`);
  return found;
}

/** Replace explicitly selected AST bodies in memory; named targets must match exactly once. */
function ablateSource(file, source, edits) {
  const matching = edits.filter(edit => edit.file === path.relative(repo, file));
  if (!matching.length) return source;
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const replacements = [];
  for (const edit of matching) {
    if (edit.replace) {
      assert.equal(source.split(edit.replace.before).length, 2, `${file}: replacement anchor`);
      source = source.replace(edit.replace.before, edit.replace.after);
      continue;
    }
    const found = [];
    const visit = node => {
      const name = node.name?.getText(tree) ?? (ts.isConstructorDeclaration(node) ? 'constructor' : ts.isArrowFunction(node) || ts.isFunctionExpression(node) ? node.parent?.name?.getText(tree) : undefined);
      if (node.body && name === edit.name &&
          (!edit.class || node.parent?.name?.getText(tree) === edit.class)) found.push(node);
      ts.forEachChild(node, visit);
    };
    visit(tree);
    assert.equal(found.length, 1, `${file}: ${edit.class ?? ''}.${edit.name}`);
    const originalBody = ts.isBlock(found[0].body) ? found[0].body.getText(tree) : `{ return ${found[0].body.getText(tree)}; }`;
    const replacementBody = edit.memoSequence ? `const key = ${JSON.stringify(edit.memoSequence)}; const cursors = globalThis.__profile99SequenceCursors; const index = cursors[key] ?? 0; cursors[key] = index + 1; const held = (globalThis.__profile99Sequences ??= {})[key] ??= []; if (index < held.length) return held[index]; const result = (() => ${originalBody})(); held[index] = result; return result;` :
      edit.memo ? `const key = ${JSON.stringify(edit.memo)}; if (globalThis.__profile99Memo?.has(key)) return globalThis.__profile99Memo.get(key); const result = (() => ${originalBody})(); (globalThis.__profile99Memo ??= new Map()).set(key, result); return result;` : edit.body;
    replacements.push({ start: found[0].body.getStart(tree), end: found[0].body.end,
      text: `{ if (!globalThis.__profile99Ablating) return (() => ${originalBody})(); ${replacementBody} }` });
  }
  for (const replacement of replacements.toSorted((a, b) => b.start - a.start))
    source = source.slice(0, replacement.start) + replacement.text + source.slice(replacement.end);
  return source;
}

/** Build variants through one EOF-closed esbuild service, with source-only resolution. */
async function buildAsync(variant) {
  const edits = variant === 'head' || variant === 'old' ? [] :
    JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8')).find(item => item.id === variant)?.edits;
  assert(edits, `Unknown variant: ${variant}`);
  const childProcess = require('node:child_process');
  const originalSpawn = childProcess.spawn;
  const services = [];
  childProcess.spawn = function (...args) {
    const child = originalSpawn.apply(this, args);
    if (String(args[0]).includes('esbuild')) services.push(child);
    return child;
  };
  let result;
  try {
    const esbuild = await import(pathToFileURL(require.resolve('esbuild')).href);
    const core = variant === 'old' ? 'src/__legacy__/core/nodeFromJSONSchema.ts' : 'src/core/nodeFromJSONSchema.ts';
    result = await esbuild.build({
      stdin: { contents: `export {nodeFromJSONSchema} from ${JSON.stringify(path.join(pkg, core))};\n` +
        `export {equivalentFixtures} from ${JSON.stringify(path.join(bf, 'fixtures/equivalent/index.ts'))};`,
        resolveDir: bf, loader: 'ts', sourcefile: 'profile-engine-entry.ts' },
      outfile: path.join(work, `${variant}.cjs`), write: false, bundle: true, packages: 'external',
      platform: 'node', format: 'cjs', jsx: 'automatic', sourcemap: 'external', sourcesContent: false,
      minify: false, define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [{ name: 'measurement-only-memory-ablation', setup(builder) {
        builder.onResolve({ filter: /^@\/schema-form\// }, ({ path: name }) =>
          ({ path: resolveSource(path.join(pkg, 'src', name.slice('@/schema-form/'.length))) }));
        builder.onLoad({ filter: /\/schema-form\/src\/.*\.tsx?$/ }, ({ path: file }) =>
          ({ contents: ablateSource(file, fs.readFileSync(file, 'utf8'), edits), loader: file.endsWith('tsx') ? 'tsx' : 'ts' }));
      } }],
    });
  } finally {
    childProcess.spawn = originalSpawn;
    for (const service of services) {
      service.ref();
      const ended = service.exitCode === null ? new Promise(resolve => service.once('exit', (code, signal) => resolve([code, signal]))) : Promise.resolve([service.exitCode, null]);
      service.stdin.end();
      const [code, signal] = await ended;
      assert.equal(code, 0, `esbuild EOF exit: ${signal}`);
    }
  }
  assert.equal(services.length, 1, 'One naturally exiting build service');
  fs.mkdirSync(work, { recursive: true });
  for (const file of result.outputFiles) {
    assert(file.contents.length <= 5_000_000, `Oversize bundle: ${file.path}`);
    fs.writeFileSync(file.path, file.contents);
  }
  const bundle = result.outputFiles.find(file => file.path.endsWith('.cjs'));
  return { variant, sha256: createHash('sha256').update(bundle.contents).digest('hex'),
    bytes: bundle.contents.length, naturalServiceExits: services.length, edits };
}

/** Extend BF's oneOf fixture to forty without changing its live payload width. */
function fixtureFor(api, name) {
  if (!name.startsWith('oneOf-')) {
    const fixture = api.equivalentFixtures.find(row => row.name === name);
    assert(fixture, name);
    return fixture;
  }
  const count = Number(name.slice(6));
  const schema = legacy => ({ type: 'object', properties: { common: { type: 'string', default: 'shared' }, kind: { type: 'string', default: 'kind_0' } },
    oneOf: Array.from({ length: count }, (_, index) => ({
      ...(legacy ? { '&if': `./kind === 'kind_${index}'` } : { controls: { active: `./kind === 'kind_${index}'` } }),
      properties: { [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
        [`payload_${index}_b`]: { type: 'number', default: index },
        [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 } },
    })) });
  return { name, workspace: schema(false), legacy: schema(true),
    interactions: [{ path: '/kind', value: 'kind_4' }, { path: '/kind', value: 'kind_0' }] };
}

const noop = () => {};
const microseconds = () => Number(process.hrtime.bigint() / 1000n);

/** Drain validator-off microtasks and the check queue, without wrapping engine callbacks. */
async function drain() {
  for (let i = 0; i < 64; i++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
}

/** Construct a cold source-backed tree; caller performs schema cloning outside timing. */
function create(api, fixture, variant, schema) {
  return api.nodeFromJSONSchema({ jsonSchema: schema ?? structuredClone(variant === 'old' ? fixture.legacy : fixture.workspace),
    ...(fixture.name === 'computed-visible-derived' ? { defaultValue: { trigger: 'on', source: 1, target: 2 } } : {}),
    validationMode: 0, onChange: noop });
}

/** Execute exactly one authored first write; the CPU stack separates it from fresh mounting. */
function profileFirstUpdate(root, interaction) {
  const node = root.find(interaction.path);
  assert(node, interaction.path);
  node.setValue(interaction.value);
}

/** Execute an alternating later write on one retained mounted form. */
function profileLaterUpdate(root, interaction, value) {
  const node = root.find(interaction.path);
  assert(node, interaction.path);
  node.setValue(value);
}

/** Read output only outside timed operations, also recording the branch-axis invariants. */
function observe(root) {
  const value = typeof root.getValue === 'function' ? root.getValue() : root.value;
  const serialized = JSON.stringify(value);
  return { sha256: createHash('sha256').update(serialized ?? '').digest('hex'),
    outputBytes: Buffer.byteLength(serialized ?? ''), liveWidth: root.children?.length,
    value };
}

/** Prepare one later-update tree with BF's authored history. */
async function prepare(api, fixture, variant) {
  const root = create(api, fixture, variant);
  await drain();
  for (const interaction of fixture.interactions) { profileFirstUpdate(root, interaction); await drain(); }
  return root;
}

/** Compute stable finite nearest-rank metrics from end-to-end observations. */
function metric(values) {
  assert(values.length && values.every(Number.isFinite));
  const sorted = values.toSorted((a, b) => a - b);
  return { median: sorted[Math.floor(sorted.length / 2)], p10: sorted[Math.ceil(sorted.length * .1) - 1],
    p90: sorted[Math.ceil(sorted.length * .9) - 1], p99: sorted[Math.ceil(sorted.length * .99) - 1], n: values.length };
}

/** Alternate two genuine transitions, avoiding repeated equal-value early returns. */
function transitionValues(fixture) {
  if (fixture.name.startsWith('oneOf-')) return ['kind_4', 'kind_0'];
  const value = fixture.interactions[0].value;
  return typeof value === 'string' ? [`${value}-later`, `${value}-again`] :
    typeof value === 'number' ? [value + 1, value] : [!value, value];
}

/** Profile unchanged code; whole-operation clocks never enter the engine's internal functions. */
async function profileWorker(variant, name, mode, targetMs = 3500) {
  const api = require(path.join(work, `${variant}.cjs`));
  const fixture = fixtureFor(api, name);
  const interaction = fixture.interactions[0];
  const values = transitionValues(fixture);
  const root = mode === 'later' ? await prepare(api, fixture, variant) : undefined;
  for (let i = 0; i < warmup; i++) {
    const current = root ?? create(api, fixture, variant);
    await drain();
    if (mode !== 'mount') {
      if (mode === 'first') profileFirstUpdate(current, interaction);
      else profileLaterUpdate(current, interaction, values[i % 2]);
      await drain();
    }
  }
  globalThis.gc();
  const beginUs = microseconds();
  let operations = 0, synchronousMs = 0, last;
  while (mode === 'first' ? synchronousMs < targetMs : (microseconds() - beginUs) / 1000 < targetMs) {
    if (mode === 'mount') {
      const schema = structuredClone(variant === 'old' ? fixture.legacy : fixture.workspace);
      last = create(api, fixture, variant, schema);
      await drain();
    } else if (mode === 'first') {
      const fresh = create(api, fixture, variant);
      await drain();
      const start = performance.now();
      profileFirstUpdate(fresh, interaction);
      synchronousMs += performance.now() - start;
      last = fresh;
      await drain();
    } else {
      profileLaterUpdate(root, interaction, values[operations % 2]);
      if (variant === 'old' || operations % 128 === 127) await drain();
      last = root;
    }
    operations++;
  }
  const endUs = microseconds();
  const evidence = observe(last);
  const meta = { head, variant, name, mode, beginUs, endUs, operations, synchronousMs,
    elapsedMs: (endUs - beginUs) / 1000, targetMs, intervalUs: 100, warmup, environment: environment(), evidence };
  save(path.join(raw, `${variant}-${name}-${mode}.meta.json`), meta);
  console.log(JSON.stringify({ variant, name, mode, operations, elapsedMs: meta.elapsedMs, synchronousMs }));
}

/** Record relevant versions and hardware without reading credential-bearing config. */
function environment() {
  return { date: new Date().toISOString(), head, node: process.version, v8: process.versions.v8,
    esbuild: require('esbuild/package.json').version, platform: process.platform, arch: process.arch,
    cpu: os.cpus()[0].model, cpus: os.cpus().length, memoryBytes: os.totalmem(),
    osRelease: os.release(), mode: 'production', validation: 'off', subscribers: 0 };
}

/** Merge samples by mapped function/file/line; recursive frames count inclusive time once. */
function summarizeProfile(variant, name, mode) {
  const profileFile = path.join(raw, `${variant}-${name}-${mode}.cpuprofile`);
  const profile = JSON.parse(fs.readFileSync(profileFile, 'utf8'));
  const meta = JSON.parse(fs.readFileSync(path.join(raw, `${variant}-${name}-${mode}.meta.json`), 'utf8'));
  const mapFile = path.join(work, `${variant}.cjs.map`);
  const sourceMap = new TraceMap(JSON.parse(fs.readFileSync(mapFile, 'utf8')));
  const nodes = new Map(profile.nodes.map(node => [node.id, node]));
  const parents = new Map();
  for (const node of nodes.values()) for (const child of node.children ?? []) parents.set(child, node.id);
  const functions = new Map();
  const keys = new Map();
  for (const node of nodes.values()) {
    const frame = node.callFrame;
    let file = frame.url || '(V8)', line = frame.lineNumber + 1, column = frame.columnNumber;
    let original;
    if (frame.url.endsWith(`${variant}.cjs`)) {
      original = originalPositionFor(sourceMap, { line: Math.max(1, line), column: Math.max(0, column) });
      if (original.source) { file = path.relative(repo, path.resolve(work, original.source)); line = original.line; column = original.column; }
    } else if (file.startsWith('file://')) file = path.relative(repo, fileURLToPath(file));
    else if (file.startsWith(repo)) file = path.relative(repo, file);
    const name = frame.functionName || '(anonymous)';
    const key = `${name}|${file}:${line}`;
    keys.set(node.id, key);
    if (!functions.has(key)) functions.set(key, { function: name, file, line, column,
      selfUs: 0, totalUs: 0, selfSamples: 0, totalSamples: 0 });
  }
  let timestamp = profile.startTime, selectedUs = 0, selectedSamples = 0, idleUs = 0;
  const ancestry = new Map();
  for (const node of nodes.values()) {
    const stack = [];
    let current = node.id;
    while (current !== undefined) { stack.push(current); current = parents.get(current); }
    ancestry.set(node.id, stack);
  }
  for (let i = 0; i < profile.samples.length; i++) {
    const delta = profile.timeDeltas[i];
    timestamp += delta;
    if (timestamp < meta.beginUs || timestamp > meta.endUs) continue;
    const id = profile.samples[i], stack = ancestry.get(id);
    if (mode === 'first' && !stack.some(frame => nodes.get(frame).callFrame.functionName === 'profileFirstUpdate')) continue;
    if (nodes.get(id).callFrame.functionName === '(idle)') { idleUs += delta; continue; }
    selectedUs += delta; selectedSamples++;
    const leaf = functions.get(keys.get(id));
    leaf.selfUs += delta; leaf.selfSamples++;
    const visited = new Set();
    for (const frame of stack) {
      const key = keys.get(frame);
      if (visited.has(key)) continue;
      visited.add(key);
      const fn = functions.get(key);
      fn.totalUs += delta; fn.totalSamples++;
    }
  }
  const rows = [...functions.values()].filter(fn => fn.totalSamples).map(fn => ({ ...fn,
    selfMs: fn.selfUs / 1000, totalMs: fn.totalUs / 1000,
    selfPercent: fn.selfUs / selectedUs * 100, totalPercent: fn.totalUs / selectedUs * 100,
    selfUsPerOperation: fn.selfUs / meta.operations, totalUsPerOperation: fn.totalUs / meta.operations,
  })).toSorted((a, b) => b.selfUs - a.selfUs);
  const summary = { ...meta, rawProfile: profileFile, rawBytes: fs.statSync(profileFile).size,
    denominator: 'workload non-idle samples; first updates restricted to profileFirstUpdate descendants',
    selectedMs: selectedUs / 1000, selectedSamples, idleMs: idleUs / 1000,
    cpuUsPerOperation: selectedUs / meta.operations, functions: rows,
    top25AndAtLeast2Percent: rows.filter((fn, i) => i < 25 || fn.selfPercent >= 2 || fn.totalPercent >= 2),
    ablationCandidates: rows.filter(fn => fn.totalPercent >= 5 &&
      (fn.file.startsWith('packages/canard/schema-form/src/') || fn.file.includes('@winglet/'))),
  };
  save(path.join(output, 'profile-99c01', `profile-99c01-${variant}-${name}-${mode}.json`), summary);
  console.log(JSON.stringify({ variant, name, mode, selectedMs: summary.selectedMs, selectedSamples,
    top: rows.filter(fn => fn.file.startsWith('packages/canard/schema-form/src/')).slice(0,10)
      .map(fn => ({ name: fn.function, file: fn.file, line: fn.line, self: fn.selfPercent, total: fn.totalPercent })) }));
  return summary;
}

/** End-to-end sentinel measurement; schema preparation and GC happen outside the clock. */
async function measured(operation) {
  const start = performance.now();
  const result = operation();
  await drain();
  return { result, ms: performance.now() - start };
}

/** Pair unchanged HEAD with one ablation/old engine in a fresh process, alternating order. */
async function paired(variant, name, mode, run) {
  const versions = ['head', variant];
  const apis = Object.fromEntries(versions.map(v => [v, require(path.join(work, `${v}.cjs`))]));
  const fixtures = Object.fromEntries(versions.map(v => [v, fixtureFor(apis[v], name)]));
  if (variant === 'gate-condition' || variant === 'gate-evaluation-zero') {
    const seed = create(apis.head, fixtures.head, 'head');
    await drain();
    const literals = new Map();
    for (const node of seed.runtime.blueprint.nodes) for (const declaration of node.declarations)
      for (const gate of declaration.gates) {
        const literal = /kind_\d+/.exec(String(gate.condition))?.[0];
        if (literal) literals.set(gate.schemaPath, literal);
      }
    assert.equal(literals.size, Number(name.slice(6)));
    globalThis.__profile99LiteralByPath = literals;
    globalThis.__profile99MountKind = observe(seed).value?.kind;
  }
  const roots = {};
  if (mode === 'later') for (const version of versions) roots[version] = await prepare(apis[version], fixtures[version], version);
  const data = Object.fromEntries(versions.map(v => [v, []]));
  const lastRoots = {};
  const deltas = [], emptyBefore = [], emptyAfter = [];
  for (let i = 0; i < samples; i++) emptyBefore.push((await measured(noop)).ms);
  const started = new Date().toISOString();
  for (let i = -warmup; i < samples; i++) {
    const pair = {};
    for (const version of i % 2 === 0 ? versions : [...versions].reverse()) {
      const api = apis[version], fixture = fixtures[version];
      const schema = mode === 'mount' ? structuredClone(version === 'old' ? fixture.legacy : fixture.workspace) : undefined;
      const root = mode === 'first' ? create(api, fixture, version) : roots[version];
      if (mode === 'first') await drain();
      globalThis.__profile99Target = root?.find(fixture.interactions[0].path);
      globalThis.__profile99SequenceCursors = {};
      if (variant === 'gate-evaluation-zero') {
        const kind = mode === 'mount' ? globalThis.__profile99MountKind :
          mode === 'first' ? fixture.interactions[0].value :
            transitionValues(fixture)[(i + warmup) % 2];
        globalThis.__profile99GateResultByPath = new Map(
          [...globalThis.__profile99LiteralByPath].map(([key, literal]) => [key, kind === literal]));
      }
      globalThis.gc();
      globalThis.__profile99Ablating = version !== 'head' && version !== 'old';
      const sample = await measured(() => mode === 'mount' ? create(api, fixture, version, schema) :
        mode === 'first' ? profileFirstUpdate(root, fixture.interactions[0]) :
          profileLaterUpdate(root, fixture.interactions[0], transitionValues(fixture)[(i + warmup) % 2]));
      globalThis.__profile99Ablating = false;
      lastRoots[version] = mode === 'mount' ? sample.result : root;
      globalThis.__profile99Target = undefined;
      pair[version] = sample.ms;
      if (i >= 0) data[version].push(sample.ms);
    }
    if (i >= 0) deltas.push(pair.head - pair[variant]);
  }
  for (let i = 0; i < samples; i++) emptyAfter.push((await measured(noop)).ms);
  const empty = (metric(emptyBefore).median + metric(emptyAfter).median) / 2;
  const metrics = Object.fromEntries(versions.map(v => [v, metric(data[v].map(ms => ms - empty))]));
  const result = { head, variant, name, mode, run, warmup, samples, started,
    ended: new Date().toISOString(), environment: environment(), emptyBefore: metric(emptyBefore),
    emptyAfter: metric(emptyAfter), subtractedEmptyMs: empty, metrics,
    boundMs: metrics.head.median - metrics[variant].median, pairedDelta: metric(deltas),
    observations: Object.fromEntries(versions.map(v => [v, observe(lastRoots[v])])),
    timingsMs: data, pairedDeltasMs: deltas };
  save(path.join(output, 'profile-99c01', `profile-99c01-paired-${variant}-${name}-${mode}-r${run}.json`), result);
  console.log(JSON.stringify({ variant, name, mode, run, headMs: metrics.head.median,
    variantMs: metrics[variant].median, boundMs: result.boundMs, pairedMedian: result.pairedDelta.median }));
}

/** Execute one sequential naturally exiting worker; signals and unexpected exits fail loudly. */
function child(args) {
  const result = spawnSync(process.execPath, args, { cwd: repo, env: { ...process.env, NODE_ENV: 'production' },
    encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  console.log(result.stdout.trim());
  return result.stdout.trim();
}

const pathToFileURL = name => new URL(`file://${name}`);
const [command, ...args] = process.argv.slice(2);
if (command === '--build') {
  const records = [];
  for (const variant of args.length ? args : ['head', 'old'])
    records.push(JSON.parse(child([script, '--build-worker', variant])));
  save(path.join(work, 'builds.json'), { environment: environment(), records });
} else if (command === '--build-worker') {
  console.log(JSON.stringify(await buildAsync(args[0])));
} else if (command === '--profile-worker') {
  await profileWorker(args[0], args[1], args[2], Number(args[3] ?? 3500));
} else if (command === '--profiles') {
  fs.mkdirSync(raw, { recursive: true });
  const operations = args.length ? [args] : [
    ...['oneOf-5', 'oneOf-40', ...fixed].flatMap(name => [['head', name, 'later'], ['head', name, 'first']]),
    ...fixed.map(name => ['old', name, 'later']),
    ...mounts.flatMap(name => [['head', name, 'mount'], ['old', name, 'mount']]),
  ];
  for (const [variant, name, mode] of operations) {
    child(['--expose-gc', '--cpu-prof', '--cpu-prof-interval=100', `--cpu-prof-dir=${raw}`,
      `--cpu-prof-name=${variant}-${name}-${mode}.cpuprofile`, script, '--profile-worker', variant, name, mode, args[3] ?? '3500']);
    summarizeProfile(variant, name, mode);
  }
} else if (command === '--summarize-profile') {
  summarizeProfile(args[0], args[1], args[2]);
} else if (command === '--paired-worker') {
  await paired(args[0], args[1], args[2], Number(args[3]));
} else if (command === '--paired') {
  for (let run = 1; run <= 3; run++) child(['--expose-gc', script, '--paired-worker', args[0], args[1], args[2], String(run)]);
} else if (command === '--matrix') {
  const configs = JSON.parse(fs.readFileSync(path.join(output, 'profile-99c01/profile-99c01-ablations.json'), 'utf8'));
  for (const config of configs.filter(item => !args.length || args.includes(item.id))) {
    child([script, '--build-worker', config.id]);
    for (const operation of config.operations) for (let run = 1; run <= 3; run++)
      child(['--expose-gc', script, '--paired-worker', config.id, operation.name, operation.mode, String(run)]);
  }
} else {
  throw new Error('Use --build, --profiles [variant fixture mode], --paired variant fixture mode');
}
