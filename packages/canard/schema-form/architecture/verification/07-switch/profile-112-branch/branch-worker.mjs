// CLI worker: one size and one run. Only scratch copies are instrumented; profiles use unchanged source.
import assert from 'node:assert/strict';
import childProcess, { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import inspector from 'node:inspector';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { instrumentVisits } from './instrument-visits.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const D = path.dirname(here), pkg = path.resolve(D, '../../..'), repo = path.resolve(pkg, '../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles/profile-112-branch';
assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
const head = 'bef81f4d747d028b05082d594138148520e4d992';
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);
const [mode, sizeText, runText] = process.argv.slice(2), size = Number(sizeText), run = Number(runText);
assert(['counts', 'cpu'].includes(mode) && [5, 10, 20, 40].includes(size) && run >= 1 && run <= 9);
assert.equal(typeof globalThis.gc, 'function');
const processStart = performance.now(), started = new Date().toISOString();
const deadline = () => assert(performance.now() - processStart < 420_000, 'Worker self deadline');
const req = createRequire(path.join(pkg, 'package.json'));
const bf = path.join(repo, 'packages/aileron/benchmark-form');
const bfReq = createRequire(path.join(bf, 'package.json'));
const { build } = req('esbuild'), ts = req('typescript');
const hash = value => createHash('sha256').update(value).digest('hex');
process.env.NODE_ENV = 'development';
const sites = [], sources = [], services = [], serviceExits = [];
let collecting = false, currentBranch = null, counts = {};
function branchOf(value) {
  if (typeof value === 'string') {
    const match = value.match(/(?:#?\/oneOf\/|payload_)(\d+)(?:\/|_|$)/);
    return match ? Number(match[1]) : null;
  }
  if (!value || typeof value !== 'object') return null;
  if (Array.isArray(value) && value.length === 1) return branchOf(value[0]);
  for (const key of ['schemaPath', 'path', 'name']) {
    const branch = branchOf(Object.getOwnPropertyDescriptor(value, key)?.value);
    if (branch !== null) return branch;
  }
  for (const key of ['gate', 'blueprintNode', 'node']) {
    const nested = Object.getOwnPropertyDescriptor(value, key)?.value;
    if (nested && nested !== value) { const branch = branchOf(nested); if (branch !== null) return branch; }
  }
  return null;
}
function visit(key, values, scoped) {
  if (!collecting) return null;
  const previous = currentBranch;
  let branch = null;
  for (const value of values) { branch = branchOf(value); if (branch !== null) break; }
  branch ??= currentBranch;
  const rows = counts[key] ??= {};
  rows[branch ?? 'unbound'] = (rows[branch ?? 'unbound'] ?? 0) + 1;
  if (scoped) currentBranch = branch;
  return { previous };
}
globalThis.__112enter = (key, values) => visit(key, values, true);
globalThis.__112hit = (key, values) => visit(key, values, false);
globalThis.__112exit = frame => { if (frame) currentBranch = frame.previous; };
const functionProxies = new WeakMap(), moduleProxies = new Map();
function countedRequire(id) {
  const exports = bfReq(id);
  if (!/^@winglet\//.test(id) || !exports || typeof exports !== 'object') return exports;
  if (moduleProxies.has(id)) return moduleProxies.get(id);
  const proxy = new Proxy(exports, { get(target, name, receiver) {
    const value = Reflect.get(target, name, receiver);
    if (typeof value !== 'function') return value;
    const descriptor = Reflect.getOwnPropertyDescriptor(target, name);
    if (descriptor && descriptor.configurable === false && descriptor.writable === false && 'value' in descriptor) return value;
    let wrapped = functionProxies.get(value);
    if (!wrapped) {
      const key = `${id}:external:${String(name)}`; sites.push(key);
      wrapped = new Proxy(value, { apply(fn, self, args) {
        const frame = globalThis.__112enter(key, args);
        try { return Reflect.apply(fn, self, args); } finally { globalThis.__112exit(frame); }
      } });
      functionProxies.set(value, wrapped);
    }
    return wrapped;
  } });
  moduleProxies.set(id, proxy); return proxy;
}
const originalSpawn = childProcess.spawn;
childProcess.spawn = function (file, args, options) {
  const child = originalSpawn(file, args, options);
  if (String(file).includes('esbuild')) services.push(child);
  return child;
};
const bundlePath = path.join(scratch, `oneOf-${size}-${mode}-r${run}.cjs`);
const result = await build({
  stdin: { contents: `export {nodeFromJSONSchema} from ${JSON.stringify(path.join(pkg, 'src/core/nodeFromJSONSchema.ts'))};
    export {branchFixtures} from ${JSON.stringify(path.join(bf, 'fixtures/equivalent/branches.ts'))};`, resolveDir: bf, loader: 'ts' },
  write: false, outfile: bundlePath, bundle: true, packages: 'external', platform: 'node', format: 'cjs', sourcemap: 'external',
  define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) },
  plugins: [{ name: 'scratch-source-only', setup(builder) {
    builder.onResolve({ filter: /^@\/schema-form/ }, args => {
      const base = path.join(pkg, 'src', args.path.replace(/^@\/schema-form\/?/, ''));
      const file = [base + '.ts', base + '.tsx', path.join(base, 'index.ts'), path.join(base, 'index.tsx'), base]
        .find(value => fs.existsSync(value) && fs.statSync(value).isFile());
      assert(file, `Missing alias ${args.path}`); return { path: file };
    });
    builder.onLoad({ filter: /\/benchmark-form\/fixtures\/equivalent\/branches\.ts$/ }, args => ({
      contents: fs.readFileSync(args.path, 'utf8').replace('[5, 10, 20].map', '[5, 10, 20, 40].map'), loader: 'ts' }));
    builder.onLoad({ filter: /\/schema-form\/src\/.*\.tsx?$/ }, args => {
      const original = fs.readFileSync(args.path, 'utf8');
      const relative = path.relative(pkg, args.path);
      sources.push({ path: relative, sha256: hash(original) });
      const contents = mode === 'counts' ? instrumentVisits(relative, original, ts, sites) : original;
      if (mode === 'counts') {
        const copy = path.join(scratch, 'instrumented', relative);
        fs.mkdirSync(path.dirname(copy), { recursive: true }); fs.writeFileSync(copy, contents);
      }
      return { contents, loader: args.path.endsWith('tsx') ? 'tsx' : 'ts' };
    });
  } }],
});
childProcess.spawn = originalSpawn;
for (const service of services) {
  service.ref(); const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode, null]);
  service.stdin.end(); const [code, signal] = await ended;
  assert.equal(code, 0); assert.equal(signal, null); serviceExits.push({ code, signal, mechanism: 'stdin EOF' });
}
for (const file of result.outputFiles) fs.writeFileSync(file.path, file.contents);
const bundle = result.outputFiles.find(file => file.path.endsWith('.cjs')).text;
assert(mode === 'counts' || !/__112enter|__112hit|__phaseEnter|__phaseExit/.test(bundle));
const module = { exports: {} };
new Function('require', 'module', 'exports', `${bundle}\n//# sourceURL=${bundlePath}`)(
  mode === 'counts' ? countedRequire : bfReq, module, module.exports);
const { nodeFromJSONSchema, branchFixtures } = module.exports;
const fixture = branchFixtures.find(item => item.name === `oneOf-${size}`); assert(fixture);
const props = () => ({ jsonSchema: structuredClone(fixture.workspace), validationMode: 0, onChange: () => {} });
const create = () => nodeFromJSONSchema(props());
const write = (root, kind) => root.find('/kind').setValue(kind);
const value = root => root.value;
const check = (root, kind) => {
  const actual = value(root); assert.equal(actual.kind, kind);
  assert.equal(Object.keys(actual).filter(key => key.startsWith('payload_')).length, 3);
  const branch = Number(kind.slice(5));
  assert.equal(actual[`payload_${branch}_a`], `a_${branch}`);
  assert.equal(actual[`payload_${branch}_b`], branch);
  assert.equal(actual[`payload_${branch}_c`], branch % 2 === 0);
};
for (let index = 0; index < 20; index++) {
  deadline(); const root = create(); write(root, 'kind_4'); write(root, 'kind_0'); write(root, 'kind_4'); check(root, 'kind_4');
}
globalThis.gc();
const records = {};
if (mode === 'counts') {
  const root = create();
  for (const [name, kind] of [['first', 'kind_4'], ['second', 'kind_0'], ['later', 'kind_4']]) {
    counts = {}; currentBranch = null; collecting = true;
    write(root, kind); collecting = false;
    assert.equal(currentBranch, null); check(root, kind);
    records[name] = { transition: name === 'second' ? 'kind_4→kind_0' : 'kind_0→kind_4', counts };
  }
  write(root, 'kind_0');
  for (let index = 0; index < 20; index++) write(root, index % 2 ? 'kind_0' : 'kind_4');
  records.steady = {};
  for (let index = 0; index < 101; index++) {
    counts = {}; currentBranch = null; collecting = true;
    const kind = index % 2 ? 'kind_0' : 'kind_4'; write(root, kind); collecting = false;
    assert.equal(currentBranch, null); check(root, kind);
    const key = hash(JSON.stringify(counts));
    const group = records.steady[key] ??= { transitions: [], kind, counts };
    group.transitions.push(index);
  }
} else {
  const session = new inspector.Session(); session.connect();
  const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params,
    (error, result) => error ? reject(error) : resolve(result)));
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 50 });
  const roots = Array.from({ length: 101 }, create);
  const profile = async (name, operation) => {
    deadline(); globalThis.gc(); await new Promise(resolve => setImmediate(resolve));
    await post('Profiler.start');
    const startUs = Number(process.hrtime.bigint() / 1000n), start = performance.now();
    for (let index = 0; index < 101; index++) operation(index);
    const elapsedMs = performance.now() - start, endUs = Number(process.hrtime.bigint() / 1000n);
    const { profile: cpu } = await post('Profiler.stop');
    records[name] = { startUs, endUs, elapsedMs, transitions: 101, profile: cpu };
    console.error(`CPU oneOf-${size} r${run} ${name}: ${elapsedMs.toFixed(3)}ms / 101`);
  };
  await profile('first', index => write(roots[index], 'kind_4'));
  roots.forEach(root => check(root, 'kind_4'));
  await profile('second', index => write(roots[index], 'kind_0'));
  roots.forEach(root => check(root, 'kind_0'));
  const root = roots[0];
  for (let index = 0; index < 20; index++) write(root, index % 2 ? 'kind_0' : 'kind_4');
  await profile('later', index => write(root, index % 2 ? 'kind_0' : 'kind_4'));
  check(root, 'kind_4');
  await post('Profiler.disable'); session.disconnect();
}
assert.equal(execFileSync('git', ['--no-optional-locks', 'rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim(), head);
assert.equal(process.getActiveResourcesInfo().filter(name => ['Timeout', 'Immediate', 'MessagePort', 'PROCESSWRAP'].includes(name)).length, 0);
deadline();
const summary = { mode, size, untouchedBranches: size - 2, run, head, node: process.version, v8: process.versions.v8,
  cpu: os.cpus()[0].model, validation: 'off', warmup: 20, sampleCount: 101, externalSubscribers: 0, onChange: 'noop',
  engineClocks: 0, officialEngineInstrumentation: mode === 'counts', cpuSamplingIntervalUs: mode === 'cpu' ? 50 : null,
  explicitGcOutsideProfile: true, started, ended: new Date().toISOString(), elapsedMs: performance.now() - processStart,
  bundlePath, bundleSha256: hash(bundle), bundleBytes: Buffer.byteLength(bundle), sources, serviceExits, sites, records };
const output = JSON.stringify(summary);
assert(Buffer.byteLength(output) <= 5_000_000);
const rawPath = path.join(scratch, `${mode}-oneOf-${size}-r${run}.json`);
fs.writeFileSync(rawPath, output);
console.log(JSON.stringify({ file: rawPath, bytes: Buffer.byteLength(output), elapsedMs: summary.elapsedMs,
  mode, size, run, serviceExits, sources: sources.length, sites: sites.length }));
