// Sequential local-source runner; each esbuild service ends naturally before core work.
import assert from 'node:assert/strict';
import cp from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const directory = path.resolve(path.dirname(script), '..');
const pkg = path.resolve(directory, '../../..');
const repo = path.resolve(pkg, '../../..');
const require = createRequire(path.join(pkg, 'package.json'));
const head = 'c468f7e6f8cc84258ada1cc8cf76df92f3c7c73e';
const fixtures = ['oneOf-5', 'oneOf-10', 'oneOf-20', 'oneOf-40', 'sample-0', 'flat-500'];
const warmup = 20, samples = 101;
const prefix = 'round-99-gate-selection';

/** Write bounded samples or detailed summaries in the authorized verification directory. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(directory, name), text, { flag: 'wx' });
}

/** Nearest-rank statistics retain timing units in milliseconds. */
function metric(values) {
  const sorted = values.toSorted((a, b) => a - b);
  return { median: sorted[Math.ceil(sorted.length * .5) - 1],
    p99: sorted[Math.ceil(sorted.length * .99) - 1], samples: sorted.length };
}

/** Observe public state and delivery order outside each measured interval. */
function observe(root) {
  const nodes = [], pending = [root];
  while (pending.length) {
    const node = pending.pop();
    nodes.push({ path: node.path, raw: node.value, emit: node.emit, errors: node.errors,
      revisions: node.revisionLedger, active: node.active, visible: node.visible,
      disabled: node.disabled, schema: node.schema });
    const children = node.children ?? [];
    for (let index = children.length - 1; index >= 0; index--)
      if (children[index].parent === node) pending.push(children[index]);
  }
  return createHash('sha256').update(JSON.stringify({ nodes,
    commit: root.runtime.commitNumber, diagnostics: root.runtime.diagnostics,
    rounds: root.runtime.settlementTrace?.rounds,
    latent: [...root.runtime.latentRaw],
    deliveries: [...root.runtime.deliveries].map(node => node.path),
  })).digest('hex');
}

/** Counter insertions apply only to the separate instrumented diagnostic bundle. */
function instrument(contents, relative) {
  if (relative.endsWith('/gates/evaluateGate.ts')) {
    contents = contents.replace('return Boolean(expression.evaluate(dependencies));',
      "return (globalThis.__gateCount('conditionFunctions'), Boolean(expression.evaluate(dependencies)));");
    contents = contents.replace('      for (let index = 0; index < condition.values.length; index++)',
      "      globalThis.__gateCount('conditionFunctions');\n      for (let index = 0; index < condition.values.length; index++)");
    contents = contents.replace('  const hostPath = getGateRegistry',
      "  globalThis.__gateCount('originalSites');\n  const hostPath = getGateRegistry");
  }
  if (relative.endsWith('/gates/selectGateBucket.ts'))
    contents = contents.replaceAll('group.buckets.get(value)',
      "(globalThis.__gateCount('tableLookups'), group.buckets.get(value))")
      .replace('  return slot.bucket?.has(binding.gate) ?? false;',
        "  globalThis.__gateCount('tableMembership');\n  return slot.bucket?.has(binding.gate) ?? false;");
  if (relative.endsWith('/gates/readProjectedValue.ts'))
    contents = contents.replace('  let node: Self = context.root;',
      "  globalThis.__gateCount('baselineReads');\n  let node: Self = context.root;");
  if (/\/(?:compute\/(?:computeNode|selectChildren|selectNodeSchema)|gates\/(?:getGateRegistry|flushPendingGateReads))\.ts$/.test(relative)) {
    const ts = require('typescript');
    const source = ts.createSourceFile(relative, contents, ts.ScriptTarget.Latest, true);
    const edits = [];
    let ordinal = 0;
    const visit = node => {
      if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isWhileStatement(node)) {
        const key = `${path.basename(relative, '.ts')}.loop${++ordinal}`;
        const statement = node.statement;
        if (ts.isBlock(statement)) edits.push({ at: statement.getStart(source) + 1, text: `globalThis.__gateCount('${key}');` });
        else {
          edits.push({ at: statement.getStart(source), text: `{globalThis.__gateCount('${key}');` });
          edits.push({ at: statement.end, text: '}' });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    edits.sort((a, b) => b.at - a.at);
    for (const edit of edits) contents = contents.slice(0, edit.at) + edit.text + contents.slice(edit.at);
  }
  return contents;
}

/** Build trusted local HEAD or working sources, keeping generated bundles in memory. */
async function build(variant, counting) {
  if (variant === 'W' && !fs.existsSync(path.join(pkg, 'src/core/blueprint/utils/features/GateSelectionPlans.ts'))) {
    throw new Error('The measured candidate was reverted; restore the preserved candidate source before replaying W.');
  }
  const esbuild = require('esbuild');
  const services = [];
  const spawn = cp.spawn;
  cp.spawn = function (...args) {
    const child = spawn.apply(this, args);
    if (String(args[0]).includes('esbuild') && args[1]?.some(arg => String(arg).startsWith('--service='))) services.push(child);
    return child;
  };
  let built;
  try {
    built = await esbuild.build({ stdin: { contents: `
      export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
      export { blueprint ${variant === 'W' ? ', GateSelectionPlans' : ''} } from './src/core/blueprint';
      export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';`,
      loader: 'ts', resolveDir: pkg }, write: false, bundle: true,
      packages: 'external', platform: 'node', format: 'cjs',
      define: { 'process.env.NODE_ENV': '"development"' },
      plugins: [{ name: 'local-revision', setup(builder) {
        builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
          const relative = path.relative(repo, args.path);
          if (!relative.startsWith('packages/') || relative.includes('node_modules')) return;
          let contents = variant === 'H' ? cp.execFileSync('git', ['show', `${head}:${relative}`],
            { cwd: repo, encoding: 'utf8' }) : fs.readFileSync(args.path, 'utf8');
          if (counting) contents = instrument(contents, relative);
          return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
        });
        builder.onResolve({ filter: /^@\/schema-form/ }, args => {
          const base = path.join(pkg, 'src', args.path.replace(/^@\/schema-form\/?/, ''));
          const target = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
            .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
          assert(target, args.path);
          return { path: target };
        });
      } }] });
  } finally {
    cp.spawn = spawn;
    for (const service of services) {
      service.ref();
      const ended = service.exitCode === null ? once(service, 'exit') : Promise.resolve([service.exitCode]);
      service.stdin.end();
      const [code, signal] = await ended;
      assert.equal(code, 0, `esbuild natural exit: ${signal}`);
    }
  }
  const module = { exports: {} };
  new Function('require', 'module', 'exports', built.outputFiles[0].text)(require, module, module.exports);
  return { api: module.exports, naturalExits: services.length,
    sha256: createHash('sha256').update(built.outputFiles[0].text).digest('hex') };
}

/** BF's fixed payload-width branch schema extends only its fragment count to forty. */
function fixtureFor(api, name) {
  if (name.startsWith('U19-')) {
    const count = Number(name.slice(4));
    const allOf = [];
    for (let index = 0; index < count; index++) allOf.push({ controls: { active: "./kind === 'on'" },
      properties: { shared: { type: 'string', default: 'P' } } });
    return { name, workspace: { type: 'object', properties: { kind: { type: 'string', default: 'on' },
      other: { type: 'string', default: 'other_0' } }, allOf }, interactions: [] };
  }
  if (!name.startsWith('oneOf-')) return api.equivalentFixtures.find(row => row.name === name);
  const count = Number(name.slice(6)), base = api.equivalentFixtures.find(row => row.name === 'oneOf-5');
  const workspace = structuredClone(base.workspace);
  workspace.oneOf = [];
  for (let index = 0; index < count; index++) workspace.oneOf.push({
    controls: { active: `./kind === 'kind_${index}'` }, properties: {
      [`payload_${index}_a`]: { type: 'string', default: `a_${index}` },
      [`payload_${index}_b`]: { type: 'number', default: index },
      [`payload_${index}_c`]: { type: 'boolean', default: index % 2 === 0 },
    },
  });
  return { name, workspace, interactions: [{ path: '/kind', value: 'kind_4' }, { path: '/kind', value: 'kind_0' }] };
}

/** Spawn and await exactly one self-terminating child per fixture and variant. */
function child(mode, variant, fixture, run = 0) {
  const result = cp.spawnSync(process.execPath, ['--expose-gc', script, '--child', mode, variant, fixture, String(run)],
    { cwd: repo, encoding: 'utf8', maxBuffer: 5_000_000 });
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

if (process.argv[2] === '--child') {
  const [, , , mode, variant, name, runText] = process.argv;
  const run = Number(runText), counting = mode === 'counts';
  let activeCounts;
  globalThis.__gateCount = (key, count = 1) => {
    if (activeCounts) activeCounts[key] = (activeCounts[key] ?? 0) + count;
  };
  const built = await build(variant, counting), api = built.api, fixture = fixtureFor(api, name);
  const noop = () => {};
  const startedAt = new Date().toISOString();
  let result;
  if (counting) {
    const root = api.nodeFromJSONSchema({ jsonSchema: structuredClone(fixture.workspace), validationMode: 0, onChange: noop });
    await new Promise(resolve => setTimeout(resolve, 0));
    const transitions = [];
    const unrelated = name.startsWith('U19-');
    for (const value of unrelated ? ['other_1', 'other_0'] : ['kind_4', 'kind_0']) {
      activeCounts = {};
      root.find(unrelated ? '/other' : '/kind').setValue(value);
      const counts = activeCounts;
      activeCounts = undefined;
      transitions.push({ value, counts, hash: observe(root), liveWidth: root.children.length,
        inputBytes: Buffer.byteLength(JSON.stringify(unrelated ? { other: value } : { kind: value })), outputBytes: Buffer.byteLength(JSON.stringify(root.emit)),
        diagnostics: root.runtime.diagnostics });
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    result = { transitions };
  } else if (mode === 'memory') {
    globalThis.gc();
    const before = process.memoryUsage().heapUsed, retained = [];
    for (let index = 0; index < 128; index++) retained.push(api.blueprint(structuredClone(fixture.workspace)));
    globalThis.gc();
    const heap = process.memoryUsage().heapUsed - before;
    const plan = api.GateSelectionPlans?.get(retained[0]);
    const groups = plan ? [...new Set([...plan.values()].map(binding => binding.group))] : [];
    let buckets = 0, memberships = 0;
    for (const group of groups) {
      buckets += group.buckets.size;
      for (const bucket of group.buckets.values()) memberships += bucket.size;
    }
    result = { retained: retained.length, heapBytesPerBlueprint: heap / retained.length,
      cells: { bindings: plan?.size ?? 0, groups: groups.length, valueBuckets: buckets,
        membershipEdges: memberships, maps: plan ? 1 + groups.length : 0, bucketSets: buckets } };
  } else {
    const phase = name.startsWith('oneOf-') ? 'update' : 'later';
    const timings = { mount: [], [phase]: [] }, observations = {};
    for (let sample = -warmup; sample < samples; sample++) {
      const schema = structuredClone(fixture.workspace);
      globalThis.gc();
      let start = performance.now();
      const root = api.nodeFromJSONSchema({ jsonSchema: schema, validationMode: 0, onChange: noop });
      const mount = performance.now() - start;
      const mounted = observe(root);
      await new Promise(resolve => setTimeout(resolve, 0));
      const first = fixture.interactions[0];
      if (phase === 'later') {
        for (const interaction of fixture.interactions) root.find(interaction.path).setValue(interaction.value);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      const value = phase === 'update' ? 'kind_4' : typeof first.value === 'string' ? `${first.value}-later` :
        typeof first.value === 'number' ? first.value + 1 : !first.value;
      const target = root.find(first.path);
      start = performance.now();
      target.setValue(value);
      const updated = performance.now() - start, changed = observe(root);
      assert.equal(root.runtime.diagnostics.status, 'stable');
      if (observations.mount) assert.equal(mounted, observations.mount);
      if (observations[phase]) assert.equal(changed, observations[phase]);
      observations.mount = mounted; observations[phase] = changed;
      if (sample >= 0) { timings.mount.push(mount); timings[phase].push(updated); }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    save(`${prefix}-${name}-r${run}-${variant}-timings.json`, timings);
    result = { observations, metrics: { mount: metric(timings.mount), [phase]: metric(timings[phase]) } };
  }
  console.log(JSON.stringify({ fixture: name, variant, run, mode, ...result,
    environment: { startedAt, endedAt: new Date().toISOString(), node: process.version, v8: process.versions.v8,
      cpu: os.cpus()[0].model, instrumented: counting, validation: 'off', warmup: mode === 'timing' ? warmup : 0,
      samples: mode === 'timing' ? samples : 0, naturalEsbuildExits: built.naturalExits, bundleSha256: built.sha256 } }));
} else if (process.argv[2] === '--diagnose-counts') {
  console.log(JSON.stringify(child('counts', process.argv[3] ?? 'H', process.argv[4] ?? 'oneOf-5'), null, 2));
} else if (process.argv[2] === '--paired') {
  const runs = [], rows = [], counts = [], memory = [];
  for (const fixture of fixtures) {
    for (let run = 1; run <= 3; run++) {
      const order = run === 2 ? ['W', 'H'] : ['H', 'W'];
      for (const variant of order) {
        const result = child('timing', variant, fixture, run);
        if (runs.length) assert(runs.at(-1).environment.endedAt <= result.environment.startedAt);
        const prior = runs.find(row => row.fixture === fixture);
        if (prior) assert.deepEqual(result.observations, prior.observations);
        runs.push(result);
        console.log(`${fixture} r${run} ${variant}: 완료`);
      }
    }
    const phases = fixture.startsWith('oneOf-') ? ['mount', 'update'] : ['mount', 'later'];
    for (const phase of phases) {
      const values = { H: [], W: [] }, pairs = [];
      for (let run = 1; run <= 3; run++) {
        const pair = {};
        for (const variant of ['H', 'W']) {
          const timings = JSON.parse(fs.readFileSync(path.join(directory, `${prefix}-${fixture}-r${run}-${variant}-timings.json`)));
          assert.equal(timings[phase].length, samples);
          values[variant].push(...timings[phase]);
          pair[variant] = metric(timings[phase]);
        }
        pairs.push({ run, order: run === 2 ? 'W→H' : 'H→W', ...pair,
          changePercent: (pair.W.median / pair.H.median - 1) * 100 });
      }
      const H = metric(values.H), W = metric(values.W);
      rows.push({ fixture, phase, H, W, pairs, changePercent: (W.median / H.median - 1) * 100 });
    }
  }
  for (const fixture of fixtures.filter(name => name.startsWith('oneOf-'))) {
    const H = child('counts', 'H', fixture), W = child('counts', 'W', fixture);
    for (let index = 0; index < H.transitions.length; index++) assert.equal(H.transitions[index].hash, W.transitions[index].hash);
    counts.push({ fixture, H, W });
    const before = child('memory', 'H', fixture), after = child('memory', 'W', fixture);
    memory.push({ fixture, H: before, W: after,
      extraHeapBytesPerBlueprint: after.heapBytesPerBlueprint - before.heapBytesPerBlueprint });
    console.log(`${fixture}: 계수·메모리 완료`);
  }
  const unrelated = [];
  for (const count of [5, 10, 20, 40]) {
    const fixture = `U19-${count}`, H = child('counts', 'H', fixture), W = child('counts', 'W', fixture);
    for (let index = 0; index < H.transitions.length; index++) assert.equal(H.transitions[index].hash, W.transitions[index].hash);
    unrelated.push({ fixture, H, W });
    console.log(`${fixture}: 고정 live 폭 계수 완료`);
  }
  save(`${prefix}-measurements-summary.json`, { head, method: '동일 세션, 순차 새 프로세스, H→W/W→H/H→W, 예열20, 101×3, validation off, 무계측 시간. esbuild 자연 종료 후 측정.', runs, rows, counts, memory, unrelated });
  console.log('전체 짝 측정 완료');
} else throw new Error('Use --diagnose-counts or --paired');
