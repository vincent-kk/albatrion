// Sequential CLI worker: bundle outputs stay outside the tree and all services end by EOF.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { performance, PerformanceObserver } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(directory, '../../../..');
const repo = path.resolve(pkg, '../../..');
const require = createRequire(path.join(repo, 'package.json'));
process.env.NODE_PATH = path.join(repo, 'node_modules');
require('node:module').Module._initPaths();
const HEAD = 'baf4cacb647ad3de7dbff7c232efddf55b0bc546';
const bundles = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const started = Date.now();
const [command, ...args] = process.argv.slice(2);
const hash = value => createHash('sha256').update(value).digest('hex');
const bundle = (version, development = false) => path.join(bundles, `owned104-${version}${development ? '-dev' : ''}.cjs`);
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const git = args => execFileSync('git', ['--no-optional-locks', '-c', 'core.fsmonitor=false', ...args], { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
assert.equal(git(['rev-parse', 'HEAD']).trim(), HEAD);

/** Persist bounded evidence; timers never write runtime bundles into the repository. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000, name);
  fs.writeFileSync(path.join(directory, name + '.json'), text);
}
process.once('exit', status => save(`process-${[command, ...args].join('-')}`, {
  HEAD, command, args, status, signal: null, started, ended: Date.now(), elapsedMs: Date.now() - started,
  driverSha256: hash(fs.readFileSync(fileURLToPath(import.meta.url))),
}));

/** Build a source-backed production engine; HEAD bytes come exclusively from git show. */
async function build(version, development) {
  const childProcess = require('node:child_process');
  const originalSpawn = childProcess.spawn;
  const services = [];
  childProcess.spawn = function (...arguments_) {
    const service = originalSpawn.apply(this, arguments_);
    if (String(arguments_[0]).includes('esbuild')) services.push(service);
    return service;
  };
  const sources = {};
  let result;
  try {
    const esbuild = require('esbuild');
    const exports = ['core/nodeFromJSONSchema.ts', 'core/blueprint/blueprint.ts',
      'core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts', 'core/blueprint/utils/itemEntry/getItemEntry.ts'];
    const names = ['nodeFromJSONSchema', 'blueprint', 'mergeEffectiveSchema', 'getItemEntry'];
    const entry = exports.map((file, index) => `export {${names[index]}} from ${JSON.stringify(path.join(pkg, 'src', file))};`).join('\n') +
      `\nexport {equivalentFixtures} from ${JSON.stringify(path.join(repo, 'packages/aileron/benchmark-form/fixtures/equivalent/index.ts'))};`;
    result = await esbuild.build({ stdin: { contents: entry, resolveDir: pkg, loader: 'ts' },
      outfile: bundle(version, development), write: false, bundle: true, packages: 'external',
      platform: 'node', format: 'cjs', jsx: 'automatic', sourcemap: 'external', sourcesContent: false,
      define: { 'process.env.NODE_ENV': JSON.stringify(development ? 'development' : 'production') },
      alias: { '@/schema-form': path.join(pkg, 'src') },
      plugins: [{ name: 'head-working-source', setup(builder) {
        builder.onLoad({ filter: /\/schema-form\/src\/.*\.tsx?$/ }, ({ path: file }) => {
          const relative = path.relative(repo, file);
          const content = version === 'head' || version === 'control' ? git(['show', `${HEAD}:${relative}`]) : fs.readFileSync(file, 'utf8');
          sources[relative] = hash(content);
          return { contents: content, loader: file.endsWith('.tsx') ? 'tsx' : 'ts' };
        });
      } }],
    });
  } finally {
    childProcess.spawn = originalSpawn;
    for (const service of services) {
      service.ref();
      const exit = service.exitCode === null
        ? new Promise(resolve => service.once('exit', (code, signal) => resolve([code, signal])))
        : Promise.resolve([service.exitCode, null]);
      service.stdin.end();
      const [code, signal] = await exit;
      assert.equal(code, 0);
      assert.equal(signal, null);
    }
  }
  assert.equal(services.length, 1);
  for (const output of result.outputFiles) fs.writeFileSync(output.path, output.contents);
  const evidence = { HEAD, version, development, sourceTreeSha256: hash(JSON.stringify(Object.entries(sources).sort())),
    sources, bundleSha256: hash(fs.readFileSync(bundle(version, development))),
    bytes: fs.statSync(bundle(version, development)).size, naturalBuildServices: services.length };
  save(`build-${version}${development ? '-dev' : ''}`, evidence);
  console.log(JSON.stringify({ ...evidence, sources: undefined }));
}

/** Keep the oneOf fixture exactly aligned with the round-99/103 driver. */
function fixtureFor(api, name) {
  if (!name.startsWith('oneOf-')) {
    const fixture = api.equivalentFixtures.find(row => row.name === name);
    assert(fixture, name);
    return fixture;
  }
  const count = Number(name.slice(6));
  const workspace = { type: 'object', properties: { common: { type: 'string', default: 'shared' }, kind: { type: 'string', default: 'kind_0' } },
    oneOf: Array.from({ length: count }, (_, index) => ({ controls: { active: `./kind === 'kind_${index}'` },
      properties: { [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
        [`payload_${index}_b`]: { type: 'number', default: index },
        [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 } } })) };
  return { name, workspace, interactions: [{ path: '/kind', value: 'kind_4' }, { path: '/kind', value: 'kind_0' }] };
}

/** Clock includes 64 microtask checkpoints and the single check-queue sentinel. */
async function measured(operation) {
  const begin = performance.now();
  const root = operation();
  for (let index = 0; index < 64; index++) await Promise.resolve();
  const end = await new Promise(resolve => setImmediate(() => resolve(performance.now())));
  return { root, begin, end, ms: end - begin };
}

/** Clone schemas outside the clock and construct with validation off and no subscribers. */
function create(api, fixture, schema) {
  return api.nodeFromJSONSchema({ jsonSchema: schema ?? structuredClone(fixture.workspace), validationMode: 0, onChange: () => {} });
}

/** Preserve authored interaction history before retained later-update measurements. */
async function prepare(api, fixture) {
  const root = create(api, fixture);
  await measured(() => {});
  for (const interaction of fixture.interactions) {
    root.find(interaction.path).setValue(interaction.value);
    await measured(() => {});
  }
  return root;
}

/** Paired fresh-process runs; steady has six balanced fixed-first orders and no forced GC. */
async function pair(regime, name, mode, run, comparator) {
  assert.equal(process.env.NODE_ENV, 'production');
  assert(globalThis.gc);
  const engines = { head: require(bundle('head')), working: require(bundle(comparator)) };
  const fixture = fixtureFor(engines.head, name);
  const interaction = fixture.interactions[0];
  const input = interaction?.value;
  const values = name.startsWith('oneOf-') ? ['kind_4', 'kind_0']
    : typeof input === 'string' ? [input + '-later', input + '-again']
    : typeof input === 'number' ? [input + 1, input] : [!input, input];
  const roots = mode === 'later' ? { head: await prepare(engines.head, fixture), working: await prepare(engines.working, fixture) } : {};
  const timings = { head: [], working: [] }, windows = [], gc = [], before = [], after = [], last = {};
  const observer = new PerformanceObserver(list => { for (const event of list.getEntries()) gc.push({ start: event.startTime, ms: event.duration, kind: event.detail.kind }); });
  observer.observe({ entryTypes: ['gc'] });
  for (let index = 0; index < 101; index++) before.push((await measured(() => {})).ms);
  for (let index = -20; index < 101; index++) {
    assert(Date.now() - started < 420000, 'Split before eight minutes');
    const first = regime === 'steady' ? run % 2 === 1 : (index + run - 1) % 2 === 0;
    const order = first ? ['head', 'working'] : ['working', 'head'];
    for (const version of order) {
      const schema = mode === 'mount' || mode === 'first' ? structuredClone(fixture.workspace) : undefined;
      if (mode === 'first') {
        roots[version] = create(engines[version], fixture, schema);
        await measured(() => {});
      }
      const target = mode !== 'mount' ? roots[version].find(interaction.path) : undefined;
      if (regime !== 'steady') {
        globalThis.gc();
        await new Promise(resolve => setImmediate(resolve));
      }
      const result = await measured(() => mode === 'mount'
        ? create(engines[version], fixture, schema)
        : target.setValue(mode === 'first' ? interaction.value : values[(index + 20) % 2]));
      last[version] = mode === 'mount' ? result.root : roots[version];
      if (index >= 0) { timings[version].push(result.ms); windows.push({ version, index, begin: result.begin, end: result.end }); }
    }
  }
  for (let index = 0; index < 101; index++) after.push((await measured(() => {})).ms);
  await new Promise(resolve => setImmediate(resolve));
  observer.disconnect();
  const observations = {};
  for (const version of ['head', 'working']) observations[version] = hash(JSON.stringify(last[version].value));
  assert.equal(observations.head, observations.working);
  const empty = median([...before, ...after]);
  const evidence = { HEAD, regime, name, mode, run, comparator, freshProcess: true, warmup: 20, samples: 101,
    forcedGCOutsideClock: regime !== 'steady', firstOrder: run % 2 ? 'head' : 'working',
    headMs: median(timings.head) - empty, workingMs: median(timings.working) - empty,
    empty, timingsMs: timings, pairedDeltasMs: timings.head.map((value, index) => value - timings.working[index]),
    emptyTimingsMs: { before, after }, windows, gc, observations,
    bundleSha256: { head: hash(fs.readFileSync(bundle('head'))), working: hash(fs.readFileSync(bundle(comparator))) },
    started, ended: Date.now(), elapsedMs: Date.now() - started };
  save(`${regime}-${name}-${mode}-r${run}`, evidence);
  console.log(JSON.stringify({ regime, name, mode, run, headMs: evidence.headMs, workingMs: evidence.workingMs,
    pairedMedianMs: median(evidence.pairedDeltasMs), seconds: evidence.elapsedMs / 1000 }));
}

/** Count distinct mount freezes independently of timing, excluding module initialization. */
async function count(version, name, development) {
  const engine = require(bundle(version, development));
  const fixture = fixtureFor(engine, name);
  const native = Object.freeze, values = new Set();
  let calls = 0, primitives = 0, completed = 0;
  Object.freeze = value => {
    calls++;
    if (value && (typeof value === 'object' || typeof value === 'function')) values.add(value); else primitives++;
    const stack = new Error().stack;
    if (/at blueprint \(/.test(stack.split('\n')[2])) completed++;
    return native(value);
  };
  let root;
  try { root = create(engine, fixture); await measured(() => {}); }
  finally { Object.freeze = native; }
  const nodes = root.runtime.blueprint.nodes.length;
  const evidence = { HEAD, version, name, mode: development ? 'development' : 'production', nodes,
    calls, distinct: values.size, repeatCalls: calls - primitives - values.size, primitives, completed,
    freezesPerNode: values.size / nodes };
  save(`count-${version}-${name}${development ? '-dev' : ''}`, evidence);
  console.log(JSON.stringify(evidence));
}

if (command === 'build') await build(args[0], args[1] === 'dev');
else if (command === 'pair') await pair(args[0], args[1], args[2], Number(args[3]), args[4]);
else if (command === 'count') await count(args[0], args[1], args[2] === 'dev');
else if (command === 'fixtures') {
  const engine = require(bundle('head'));
  const fixtures = ['nested-d5-f4', 'flat-500', 'oneOf-20', 'sample-0'].map(name => ({ name, schema: fixtureFor(engine, name).workspace }));
  const text = JSON.stringify(fixtures) + '\n';
  assert(Buffer.byteLength(text) < 5_000_000);
  fs.writeFileSync(path.join(pkg, 'src/core/blueprint/__tests__/fixtures/ownedInlineMounts.json'), text);
  console.log('MOUNT_FIXTURES_104_OK');
} else if (command === 'batch') {
  const [regime, name, mode] = args;
  const count = regime === 'steady' ? 6 : 3;
  for (let run = 1; run <= count; run++) {
    assert(Date.now() - started < 360000, 'Split batch before eight minutes');
    const worker = spawnSync(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), 'pair', regime, name, mode, String(run), regime.startsWith('noise') ? 'control' : 'working'], {
      env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8', maxBuffer: 5_000_000 });
    assert.equal(worker.signal, null);
    assert.equal(worker.status, 0, worker.stderr);
    console.log(worker.stdout.trim());
  }
} else throw new Error('Unknown command ' + command);
