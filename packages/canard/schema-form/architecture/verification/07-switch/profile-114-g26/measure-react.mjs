// Loaded by Node from the stage-07 root; --pair selects two sequential fresh workers.
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import Module, { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { instrumentRound93i } from '../tools/instrument-round-93i.mjs';
import { instrumentCore } from './instrument-core.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(directory, '../../../../../../..');
const pkg = path.join(repo, 'packages/canard/schema-form');
const bf = path.join(repo, 'packages/aileron/benchmark-form');
const bfRequire = createRequire(path.join(bf, 'package.json'));
const pkgRequire = createRequire(path.join(pkg, 'package.json'));
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
assert.equal(repo, '/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07');
assert.equal(head, 'af3cd579b892393de3693f737afe68cfce3993f8');
const started = performance.now();
const lane = process.argv.includes('--phases') ? 'phases' : 'plain';
const fixtureName = process.argv[3];
const run = Number(process.argv[4]);
const warmup = 20;
const samples = 101;

/** Write bounded measurement evidence with exclusive filenames. */
function save(name, value) {
  const contents = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(contents) <= 5_000_000);
  fs.writeFileSync(path.join(directory, name), contents, { flag: 'wx' });
}

/** Summarize an odd sample count using nearest-rank quantiles. */
function quantiles(values) {
  const sorted = values.toSorted((left, right) => left - right);
  return { median: sorted[Math.ceil(sorted.length / 2) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], count: sorted.length };
}

/** Canonicalize observed values so property enumeration order does not change equivalence. */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}

if (process.argv[2] === '--pair') {
  assert(run >= 1 && run <= 3);
  const order = run === 2 ? ['HEAD', '0.16.0'] : ['0.16.0', 'HEAD'];
  const workers = [];
  for (const version of order) {
    const childStart = performance.now();
    const args = ['--expose-gc', fileURLToPath(import.meta.url), '--worker', fixtureName, String(run), version];
    if (lane === 'phases') args.push('--phases');
    const result = spawnSync(process.execPath, args, { cwd: repo, stdio: 'inherit' });
    assert.equal(result.status, 0, `${version} worker must end naturally`);
    assert.equal(result.signal, null);
    const seconds = (performance.now() - childStart) / 1000;
    assert(seconds < 220, 'Split this measurement before increasing its duration');
    workers.push({ version, seconds, exit: result.status, signal: result.signal });
  }
  const reports = order.map(version => JSON.parse(fs.readFileSync(
    path.join(directory, `react-${lane}-${fixtureName}-r${run}-${version}.json`), 'utf8')));
  assert.deepEqual(reports[0].observations, reports[1].observations, 'Both versions must render equivalent values and paths');
  save(`pair-${lane}-${fixtureName}-r${run}.json`, { head, fixture: fixtureName, run, lane, order, workers,
    seconds: (performance.now() - started) / 1000, equivalent: true });
  console.log(`PAIR_OK ${lane} ${fixtureName} r${run}: ${workers.map(item => item.seconds.toFixed(2)).join('/')} s`);
} else {
  assert.equal(process.argv[2], '--worker');
  const version = process.argv[5];
  assert(['HEAD', '0.16.0'].includes(version));
  assert(globalThis.gc, '--expose-gc is required');
  process.env.NODE_ENV = 'production';
  let collecting = false;
  let totals = {};
  let stack = [];
  globalThis.__r93iEnter = (phase, site) => {
    if (!collecting) return null;
    const frame = { phase, site, start: performance.now(), child: 0 };
    stack.push(frame);
    return frame;
  };
  globalThis.__r93iExit = frame => {
    if (!frame) return;
    const elapsed = performance.now() - frame.start;
    assert.equal(stack.pop(), frame);
    if (stack.length) stack.at(-1).child += elapsed;
    totals[frame.phase] = (totals[frame.phase] ?? 0) + elapsed - frame.child;
  };
  globalThis.__r93iCount = () => {};
  globalThis.__r93iScratch = () => {};
  const originalLoader = Module._extensions['.js'];
  const oldEntry = bfRequire.resolve('@canard/schema-form_0.16.0');
  const oldEsmEntry = oldEntry.replace(/\.cjs$/, '.mjs');
  const ts = pkgRequire('typescript');
  let legacyEsmInstrumented = false;
  const moduleHooks = lane === 'phases' ? pkgRequire('node:module').registerHooks({
    load(url, context, nextLoad) {
      const result = nextLoad(url, context);
      if (url !== pathToFileURL(oldEsmEntry).href) return result;
      legacyEsmInstrumented = true;
      return { ...result, source: instrumentCore(fs.readFileSync(oldEsmEntry, 'utf8'), oldEsmEntry, ts, true) };
    },
  }) : undefined;
  if (lane === 'phases') Module._extensions['.js'] = (module, filename) => {
    if (/react-dom-profiling\.profiling\.js$/.test(filename))
      module._compile(instrumentRound93i(fs.readFileSync(filename, 'utf8'), filename, ts), filename);
    else if (filename === oldEntry)
      module._compile(instrumentCore(fs.readFileSync(filename, 'utf8'), filename, ts, true), filename);
    else originalLoader(module, filename);
  };
  const childProcess = pkgRequire('node:child_process');
  const originalSpawn = childProcess.spawn;
  let service, serviceClose, serviceExit;
  childProcess.spawn = (...args) => {
    const child = originalSpawn(...args);
    if (path.basename(args[0]) === 'esbuild') {
      assert(!service, 'Only one build service is permitted');
      service = child;
      serviceClose = new Promise(resolve => child.once('close', (code, signal) => resolve({ code, signal })));
    }
    return child;
  };
  const { build } = pkgRequire('esbuild');
  let dom;
  try {
    const built = await build({ stdin: { resolveDir: repo, loader: 'ts', contents: `
      export { equivalentFixtures } from './packages/aileron/benchmark-form/fixtures/equivalent';
      export { mountEquivalentForm } from './packages/aileron/benchmark-form/fixtures/equivalent/utils/mountEquivalentForm';
      export { applyInteraction } from './packages/aileron/benchmark-form/fixtures/equivalent/utils/applyInteraction';
      export { setupJsdom, drainTicks } from './packages/aileron/benchmark-form/src/utils/setup-env';
    ` }, write: false, sourcemap: false, bundle: true, packages: 'external', platform: 'node',
      format: 'cjs', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [{ name: 'g26-current-source', setup(builder) {
        builder.onResolve({ filter: /^@canard\/schema-form$/ }, () => ({ path: path.join(pkg, 'src/index.ts') }));
        builder.onResolve({ filter: /^react-dom\/client$/ }, () => ({ path: bfRequire.resolve('react-dom/profiling'), external: true }));
        builder.onResolve({ filter: /^@\/schema-form/ }, args => {
          const base = path.join(pkg, 'src', args.path.replace(/^@\/schema-form\/?/, ''));
          const target = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
            .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
          assert(target, args.path);
          return { path: target };
        });
        if (lane === 'phases') builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
          if (!args.path.startsWith(path.join(pkg, 'src/core/'))) return undefined;
          let contents = instrumentRound93i(fs.readFileSync(args.path, 'utf8'), args.path, ts);
          contents = instrumentCore(contents, args.path, ts);
          return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
        });
      } }],
    });
    assert(service, 'The esbuild child must be audited');
    service.ref();
    service.stdin.end();
    serviceExit = await serviceClose;
    assert.deepEqual(serviceExit, { code: 0, signal: null }, 'Build service must exit by EOF');
    childProcess.spawn = originalSpawn;
    const bundleText = built.outputFiles[0].text;
    assert(Buffer.byteLength(bundleText) <= 5_000_000);
    const loaded = { exports: {} };
    new Function('require', 'module', 'exports', bundleText)(bfRequire, loaded, loaded.exports);
    const api = loaded.exports;
    const fixture = api.equivalentFixtures.find(item => item.name === fixtureName);
    assert(fixture, fixtureName);
    dom = api.setupJsdom();
    const { flushSync } = bfRequire('react-dom');
    const timing = Object.fromEntries(['render-mount-wall', 'render-update-wall', 'profiler-mount',
      'profiler-update', 'commits-mount', 'commits-update'].map(metric => [metric, []]));
    const phases = { mount: [], update: [] };
    let observations;
    for (let index = -warmup; index < samples; index++) {
      assert(performance.now() - started < 205_000, 'Worker reached its self-ending duration bound');
      const currentFixture = { ...fixture, legacy: structuredClone(fixture.legacy), workspace: structuredClone(fixture.workspace) };
      globalThis.gc();
      totals = {}; stack = []; collecting = lane === 'phases';
      const mounted = await api.mountEquivalentForm(currentFixture, version === 'HEAD' ? 'latest' : '0.16.0');
      collecting = false;
      assert.equal(stack.length, 0);
      const mountPhases = { ...totals };
      if (lane === 'phases') {
        assert(Object.entries(mountPhases).filter(([key]) => !key.startsWith('react-'))
          .reduce((sum, [, value]) => sum + value, 0) > 0, 'Both versions must expose core phase time');
        if (version === '0.16.0') assert(legacyEsmInstrumented, 'Legacy ESM load must be instrumented');
      }
      assert(mounted.commits.length > 0, 'Production profiling must enable Profiler');
      const mountMs = mounted.mountMs;
      const mountDuration = mounted.commits.reduce((sum, value) => sum + value, 0);
      const mountCommits = mounted.commits.length;
      const mountedValue = canonical(mounted.handle.getValue());
      const mountedPaths = [...mounted.container.querySelectorAll('[data-path]:not([data-deferred])')]
        .map(node => node.getAttribute('data-path')).sort();
      mounted.commits.length = 0;
      totals = {}; stack = []; collecting = lane === 'phases';
      let updateMs;
      try {
        const updateStart = performance.now();
        for (const interaction of fixture.interactions) {
          flushSync(() => api.applyInteraction(mounted.handle, interaction));
          await api.drainTicks(2);
        }
        updateMs = performance.now() - updateStart;
        collecting = false;
        assert.equal(stack.length, 0);
        const observation = { mounted: mountedValue, updated: canonical(mounted.handle.getValue()),
          mountedPaths, updatedPaths: [...mounted.container.querySelectorAll('[data-path]:not([data-deferred])')]
            .map(node => node.getAttribute('data-path')).sort() };
        assert(observation.mountedPaths.length > 0 && observation.updatedPaths.length > 0);
        const digest = createHash('sha256').update(JSON.stringify(observation)).digest('hex');
        if (observations) assert.equal(digest, observations.digest);
        else observations = { digest, mountedPaths: mountedPaths.length, updatedPaths: observation.updatedPaths.length };
        if (index >= 0) {
          timing['render-mount-wall'].push(mountMs);
          timing['render-update-wall'].push(updateMs);
          timing['profiler-mount'].push(mountDuration);
          timing['profiler-update'].push(mounted.commits.reduce((sum, value) => sum + value, 0));
          timing['commits-mount'].push(mountCommits);
          timing['commits-update'].push(mounted.commits.length);
          if (lane === 'phases') { phases.mount.push(mountPhases); phases.update.push({ ...totals }); }
        }
      } finally {
        collecting = false;
        mounted.teardown();
        performance.clearMeasures(); performance.clearMarks();
      }
      if (index === -1 || index >= 0 && (index + 1) % 20 === 0 || index === samples - 1)
        console.log(`${lane} ${fixtureName} r${run} ${version}: ${index < 0 ? '예열 20' : '표본 ' + (index + 1) + '/101'}, ${((performance.now() - started) / 1000).toFixed(1)} s`);
    }
    const elapsed = (performance.now() - started) / 1000;
    save(`react-${lane}-${fixtureName}-r${run}-${version}.json`, { head, fixture: fixtureName, run, version,
      environment: { node: process.version, v8: process.versions.v8, react: bfRequire('react').version,
        cpu: os.cpus()[0].model, memoryBytes: os.totalmem(), os: `${os.type()} ${os.release()} ${os.arch()}`,
        startedAt: new Date(Date.now() - elapsed * 1000).toISOString(), endedAt: new Date().toISOString(),
        warmup, samples, validation: 'off', ajvMs: 0, profiling: true, lane, schemaClone: true,
        gcOutsideClock: true, selfEndingLimitSeconds: 205, seconds: elapsed, esbuildExit: serviceExit,
        bundleSha256: createHash('sha256').update(bundleText).digest('hex'),
        legacySha256: createHash('sha256').update(fs.readFileSync(oldEsmEntry)).digest('hex'),
        legacyCjsSha256: createHash('sha256').update(fs.readFileSync(oldEntry)).digest('hex') },
      timing, summary: Object.fromEntries(Object.entries(timing).map(([metric, values]) => [metric, quantiles(values)])),
      phases: lane === 'phases' ? phases : undefined, observations });
  } finally {
    Module._extensions['.js'] = originalLoader;
    moduleHooks?.deregister();
    collecting = false;
    dom?.window.close();
    childProcess.spawn = originalSpawn;
    if (service && !serviceExit) {
      service.ref();
      service.stdin.end();
      const result = await serviceClose;
      assert.deepEqual(result, { code: 0, signal: null });
    }
  }
}
