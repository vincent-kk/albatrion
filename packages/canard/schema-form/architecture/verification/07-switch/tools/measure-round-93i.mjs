// Invoked by measure-round-90-baseline.mjs --round93i; all bundles stay in memory.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import Module, { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import v8 from 'node:v8';
import { fileURLToPath } from 'node:url';
import { instrumentRound93i } from './instrument-round-93i.mjs';
import { instrumentRound93Structures } from './instrument-round-93-structures.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const verification = path.resolve(directory, '..');
const pkg = path.resolve(verification, '../../..');
const repo = path.resolve(pkg, '../../..');
const require = createRequire(path.join(pkg, 'package.json'));
const bfRequire = createRequire(path.join(repo, 'packages/aileron/benchmark-form/package.json'));
const fixtures = ['flat-500', 'nested-d5-f4', 'array-1000', 'computed-visible-derived', 'oneOf-20'];
const warmup = 20, sampleCount = 101;
const renderPhases = process.argv.includes('--react-phases');
const render = process.argv.includes('--react') || renderPhases;
const costs = process.argv.includes('--costs');
const traced = process.argv.includes('--phases') || costs || renderPhases;
const variant = process.argv[5];
const revision = variant === 'H' ? 'af1904cf9' : undefined;
process.env.NODE_ENV = render ? 'production' : 'development';

/** Write only timing arrays or bounded aggregate detail; no per-sample traces. */
function save(name, value) {
  const text = JSON.stringify(value, null, 2) + '\n';
  assert(Buffer.byteLength(text) <= 5_000_000);
  fs.writeFileSync(path.join(verification, name), text, { flag: 'wx' });
}
function metric(values) {
  const ordered = values.toSorted((left, right) => left - right);
  return { median: ordered[Math.ceil(ordered.length * .5) - 1] ?? 0,
    p99: ordered[Math.ceil(ordered.length * .99) - 1] ?? 0, sampleCount: values.length };
}
/** Count distributions remain in summaries, so paired aggregate quantiles stay exact. */
function frequency(values) {
  const result = {};
  for (const value of values) result[value] = (result[value] ?? 0) + 1;
  return result;
}
async function drain() {
  for (let index = 0; index < 16; index++) await Promise.resolve();
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));
}

let collecting = false, totals = {}, calls = {}, sites = {}, stack = [], counts = {}, paths = {};
let peakScratch = {}, peakFrames = [];
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
  if (stack.length) stack[stack.length - 1].child += elapsed;
  const own = elapsed - frame.child;
  totals[frame.phase] = (totals[frame.phase] ?? 0) + own;
  calls[frame.phase] = (calls[frame.phase] ?? 0) + 1;
  const detail = sites[frame.site] ??= { ms: 0, calls: 0 };
  detail.ms += own;
  detail.calls++;
};
globalThis.__r93iCount = (key, nodePath) => {
  if (!collecting) return;
  counts[key] = (counts[key] ?? 0) + 1;
  if (costs && nodePath !== undefined) {
    const visits = paths[key] ??= {};
    visits[nodePath] = (visits[nodePath] ?? 0) + 1;
  }
};
globalThis.__r93iScratch = context => {
  if (!costs || !collecting) return;
  const scratch = context.root.runtime.settlementScratch;
  for (const key of Object.keys(scratch ?? {})) {
    const value = scratch[key];
    if (value instanceof Map || value instanceof Set || Array.isArray(value))
      peakScratch[key] = Math.max(peakScratch[key] ?? 0, value.size ?? value.length);
  }
};
globalThis.__r93iFrameStack = frames => {
  if (frames.length > peakFrames.length) peakFrames = frames.slice();
};
const allocations = {};
globalThis.__round93Count = (key, value) => {
  allocations[key] = (allocations[key] ?? 0) + 1;
  return value;
};
function begin() {
  totals = {}; calls = {}; sites = {}; stack = []; counts = {}; paths = {};
  collecting = traced;
  return performance.now();
}
function finish(start) {
  const elapsed = performance.now() - start;
  collecting = false;
  assert.equal(stack.length, 0);
  const active = Object.values(totals).reduce((sum, value) => sum + value, 0);
  return { elapsed, active, phases: { ...totals, wait: elapsed - active }, calls, sites, counts };
}

/** Build the requested revision without checkouts, generated bundles or services during timing. */
async function bundle() {
  const { build, stop } = require('esbuild');
  const result = await build({ stdin: {
    contents: `export { nodeFromJSONSchema } from './src/core/nodeFromJSONSchema';
      export { buildSchemaNodeTree, SetValueOption } from './src/core/SchemaNode';
      export { loadSchemaNodeAtMount } from './src/core/settle';
      export { equivalentFixtures } from '../../aileron/benchmark-form/fixtures/equivalent';
      ${render ? "export { Form } from './src/index';" : ''}`,
    resolveDir: pkg, loader: 'ts' }, write: false, bundle: true, packages: 'external',
    platform: 'node', format: 'cjs', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) },
    plugins: [{ name: 'round93i-source', setup(builder) {
      builder.onResolve({ filter: /^@\/schema-form/ }, args => {
        const base = path.join(pkg, 'src', args.path.replace(/^@\/schema-form\/?/, ''));
        const target = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
          .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
        assert(target, args.path);
        return { path: target };
      });
      if (revision || traced) builder.onLoad({ filter: /\.(ts|tsx)$/ }, args => {
        const relative = path.relative(repo, args.path);
        if (!relative.startsWith('packages/') || relative.includes('node_modules')) return undefined;
        let contents = revision ? execFileSync('git', ['show', `${revision}:${relative}`],
          { cwd: repo, encoding: 'utf8' }) : fs.readFileSync(args.path, 'utf8');
        if (costs) contents = instrumentRound93Structures(contents, relative, require('typescript'));
        if (traced) contents = instrumentRound93i(contents, relative, require('typescript'), costs);
        return { contents, loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts' };
      });
    } }],
  });
  stop();
  const source = result.outputFiles[0].text;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', source)(require, module, module.exports);
  let programDigest;
  if (process.env.ROUND93I_BUNDLE_PROBE === '1') {
    const ts = require('typescript');
    const parsed = ts.createSourceFile('bundle.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const program = ts.createPrinter({ removeComments: true }).printFile(parsed);
    programDigest = createHash('sha256').update(program).digest('hex');
  }
  return { api: module.exports, digest: createHash('sha256').update(source).digest('hex'), programDigest };
}

/** Inspect native backing stores in memory; never persist a heap snapshot. */
async function storageBytes(root) {
  globalThis.__r93iOrderSet = root.runtime.deliveries;
  globalThis.__r93iEmptySet = new Set();
  globalThis.__r93iScratchStorage = root.runtime.settlementScratch;
  globalThis.__r93iFrames = peakFrames;
  globalThis.gc();
  const chunks = [];
  for await (const chunk of v8.getHeapSnapshot()) chunks.push(chunk);
  const snapshot = JSON.parse(Buffer.concat(chunks).toString());
  const { nodes, edges, strings } = snapshot;
  const nf = snapshot.snapshot.meta.node_fields, ef = snapshot.snapshot.meta.edge_fields;
  const nw = nf.length, ew = ef.length;
  const size = nf.indexOf('self_size'), edgeCount = nf.indexOf('edge_count');
  const edgeType = ef.indexOf('type'), edgeName = ef.indexOf('name_or_index'), edgeTarget = ef.indexOf('to_node');
  const types = snapshot.snapshot.meta.edge_types[edgeType];
  const offsets = new Map();
  const markers = {};
  let offset = 0;
  for (let index = 0; index < nodes.length; index += nw) {
    offsets.set(index, offset);
    for (let end = offset + nodes[index + edgeCount] * ew; offset < end; offset += ew) {
      if (types[edges[offset + edgeType]] !== 'property') continue;
      const name = strings[edges[offset + edgeName]];
      if (name?.startsWith('__r93i')) markers[name] = edges[offset + edgeTarget];
    }
  }
  const outgoing = index => {
    const result = [];
    const start = offsets.get(index);
    for (let at = start, end = start + nodes[index + edgeCount] * ew; at < end; at += ew) {
      const type = types[edges[at + edgeType]];
      result.push({ type, name: type === 'element' ? edges[at + edgeName] : strings[edges[at + edgeName]],
        target: edges[at + edgeTarget] });
    }
    return result;
  };
  const table = index => outgoing(index).find(edge => edge.type === 'internal' && edge.name === 'table')?.target;
  const order = markers.__r93iOrderSet, empty = markers.__r93iEmptySet;
  assert.equal(typeof order, 'number');
  const tableIndex = table(order), emptyTable = table(empty);
  assert.equal(typeof tableIndex, 'number');
  let scratchBytes = 0;
  const seen = new Set(), pending = markers.__r93iScratchStorage === undefined ? [] : [markers.__r93iScratchStorage];
  while (pending.length) {
    const index = pending.pop();
    if (seen.has(index)) continue;
    seen.add(index);
    const type = snapshot.snapshot.meta.node_types[nf.indexOf('type')][nodes[index + nf.indexOf('type')]];
    if (type !== 'object' && type !== 'array') continue;
    scratchBytes += nodes[index + size];
    for (const edge of outgoing(index))
      if (edge.type === 'property' && edge.name !== '__proto__' ||
        edge.type === 'internal' && (edge.name === 'table' || edge.name === 'elements')) pending.push(edge.target);
  }
  const frameList = markers.__r93iFrames;
  const frames = outgoing(frameList).filter(edge => edge.type === 'element');
  return { orderSetObjectBytes: nodes[order + size], orderBackingStoreBytes: nodes[tableIndex + size],
    emptyBackingStoreBytes: nodes[emptyTable + size],
    bytesPerReservedCell: (nodes[tableIndex + size] - nodes[emptyTable + size]) / root.runtime.deliveries.size,
    newOrderCells: 0, scratchRetainedStorageBytes: scratchBytes,
    peakDfsFrames: frames.length, dfsFrameObjectBytes: frames.map(edge => nodes[edge.target + size]),
    peakDfsFrameObjectBytes: frames.reduce((sum, edge) => sum + nodes[edge.target + size], 0),
    note: 'V8 heap snapshot의 실제 self_size와 Set.table만 메모리에서 읽습니다. 셀당 값은 빈 table을 뺀 capacity 포함 상각 바이트이며 노드·payload·스키마 바이트를 포함하지 않습니다. scratch는 release 후 보유된 컨테이너·직접 backing store이며 peak 항목 수와 구별합니다.' };
}

if (process.argv[2] === '--summarize-paired') {
  await import('./summarize-round-93i.mjs');
} else {
  assert(fixtures.includes(process.argv[2]));
  assert(['H', 'W'].includes(variant));
  assert(globalThis.gc);
  const fixtureName = process.argv[2], run = Number(process.argv[3]);
  assert(run >= 1 && run <= 3);
  let React, flushSync, createRoot;
  if (render) {
    const { JSDOM } = bfRequire('jsdom');
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
    for (const key of ['window', 'document', 'navigator', 'Element', 'HTMLElement', 'HTMLInputElement',
      'HTMLFormElement', 'HTMLSelectElement', 'Event', 'MouseEvent', 'KeyboardEvent'])
      Object.defineProperty(globalThis, key, { value: key === 'window' ? dom.window : dom.window[key],
        configurable: true, writable: true });
    globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
    const originalJsLoader = Module._extensions['.js'];
    if (renderPhases) Module._extensions['.js'] = (module, filename) => {
      if (/react-dom-(client\.development|profiling\.profiling)\.js$/.test(filename))
        module._compile(instrumentRound93i(fs.readFileSync(filename, 'utf8'), filename, require('typescript')), filename);
      else originalJsLoader(module, filename);
    };
    try {
      React = bfRequire('react');
      ({ flushSync } = bfRequire('react-dom'));
      ({ createRoot } = bfRequire('react-dom/profiling'));
    } finally { Module._extensions['.js'] = originalJsLoader; }
  }
  const { api, digest, programDigest } = await bundle();
  if (process.env.ROUND93I_BUNDLE_PROBE === '1') {
    console.log(JSON.stringify({ cwd: process.cwd(), digest, programDigest }));
    process.exit(0);
  }
  const fixture = api.equivalentFixtures.find(item => item.name === fixtureName);
  const environment = { startedAt: new Date().toISOString(), node: process.version, v8: process.versions.v8,
    platform: process.platform, arch: process.arch, cpu: os.cpus()[0].model,
    warmup: costs ? 0 : warmup, samples: costs ? 1 : sampleCount, validation: 'off',
    mode: costs ? 'allocation and native-storage diagnosis' : render ? 'production profiling React' : 'development exclusive core',
    explicitGc: true, trace: traced, bundleSha256: digest };
  if (costs) {
    const start = begin();
    const root = api.nodeFromJSONSchema({ jsonSchema: structuredClone(fixture.workspace), validationMode: 0 });
    const counted = finish(start);
    const mountAllocations = { ...allocations }, scratchAtCommit = { ...peakScratch };
    const mounted = JSON.stringify(root.value);
    const startUpdate = begin();
    for (const interaction of fixture.interactions) root.find(interaction.path).setValue(interaction.value);
    const updated = finish(startUpdate);
    collecting = false;
    const cellRoot = api.buildSchemaNodeTree({ jsonSchema: structuredClone(fixture.workspace), validationMode: 0 });
    api.loadSchemaNodeAtMount(cellRoot, undefined, api.SetValueOption.Overwrite);
    const nodes = [...cellRoot.runtime.deliveries];
    const memory = await storageBytes(cellRoot);
    save(`round-93i-costs-${fixtureName}-${variant}-summary.json`, {
      fixture: fixtureName, variant, revision: revision ?? 'working-tree', environment,
      nodeCount: nodes.length, maxDepth: Math.max(...nodes.map(node => node.depth)),
      calculations: counted.counts['node-calculation'] ?? 0, assemblies: counted.counts.assembly ?? 0,
      nodeRecomputations: (counted.counts['node-calculation'] ?? 0) - nodes.length,
      mandatoryOutputTraversals: { reservationDrain: counted.counts['output-reservation-drain'] ?? 0,
        listenerSnapshot: counted.counts['output-listener-snapshot'] ?? 0 },
      genericCommitVisitor: counted.counts['generic-commit-visitor'] ?? 0,
      mountFunctionCalls: counted.calls, mountCounts: counted.counts, updateCounts: updated.counts,
      peakScratchEntries: scratchAtCommit, mountAllocations, memory,
      observationsSha256: createHash('sha256').update(JSON.stringify([mounted, JSON.stringify(root.value)])).digest('hex'),
      note: '시간 측정과 분리된 새 프로세스 진단입니다. 생성/계산/assembly/출력은 실제 core mount에서 계수하고, 배달 Set 바이트는 같은 소스의 직접 첫 load 직후 리스너 배달 전에 읽습니다. heap 원본은 저장하지 않습니다.' });
    console.log(`${fixtureName} ${variant} 비용: N=${nodes.length}, 계산=${counted.counts['node-calculation']}, assembly=${counted.counts.assembly}`);
  } else {
    const timing = { mount: [], update: [], mountWall: [], updateWall: [] };
    const details = { mount: [], update: [] };
    let observation;
    for (let sample = -warmup; sample < sampleCount; sample++) {
      const schema = structuredClone(fixture.workspace);
      globalThis.gc();
      let root, cleanup = () => {}, commits = [];
      const props = { jsonSchema: schema, validationMode: 0, onChange() {} };
      const start = begin();
      if (render) {
        const ref = React.createRef();
        const container = document.createElement('div'); document.body.appendChild(container);
        const reactRoot = createRoot(container);
        flushSync(() => reactRoot.render(React.createElement(React.Profiler, { id: fixtureName,
          onRender: (_id, _phase, duration) => commits.push(duration) }, React.createElement(api.Form, { ...props, ref }))));
        for (let tick = 0; tick < 12 && !ref.current?.findNode(''); tick++)
          await new Promise(resolve => setTimeout(resolve, 0));
        await new Promise(resolve => setTimeout(resolve, 0));
        root = ref.current?.findNode('');
        assert(root, 'React handle must become ready');
        cleanup = () => { flushSync(() => reactRoot.unmount()); container.remove(); };
      } else {
        root = api.nodeFromJSONSchema(props);
        await drain();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      const mount = finish(start);
      const mountProfiler = commits.reduce((sum, value) => sum + value, 0);
      const mountCommits = commits.length;
      const mounted = JSON.stringify(root.value);
      commits = [];
      const updateStart = begin();
      for (const interaction of fixture.interactions) {
        const frame = traced ? globalThis.__r93iEnter('other', 'harness:find-and-write') : null;
        const node = root.find(interaction.path);
        assert(node);
        if (render) flushSync(() => node.setValue(interaction.value));
        else node.setValue(interaction.value);
        globalThis.__r93iExit(frame);
        await drain();
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (render) await new Promise(resolve => setTimeout(resolve, 0));
      const update = finish(updateStart);
      assert.equal(root.runtime.diagnostics.status, 'stable');
      for (let index = 0; index < fixture.interactions.length; index++) {
        const interaction = fixture.interactions[index];
        let overwritten = false;
        for (let later = index + 1; later < fixture.interactions.length; later++) {
          if (fixture.interactions[later].path === interaction.path) { overwritten = true; break; }
        }
        if (!overwritten) {
          const value = interaction.path.split('/').slice(1).reduce((current, key) => current?.[key], root.value);
          assert.equal(value, interaction.value);
        }
      }
      const current = [mounted, JSON.stringify(root.value),
        render ? [...document.querySelectorAll('[data-path]:not([data-deferred])')].map(node => node.getAttribute('data-path')).sort() : []];
      if (observation) assert.deepEqual(current, observation);
      else observation = current;
      if (sample >= 0) {
        if (render) assert(mountCommits > 0, 'Profiler must be enabled in production profiling build');
        timing.mount.push(render ? mountProfiler : mount.active);
        timing.update.push(render ? commits.reduce((sum, value) => sum + value, 0) : update.active);
        timing.mountWall.push(mount.elapsed); timing.updateWall.push(update.elapsed);
        details.mount.push({ ...mount, commits: mountCommits });
        details.update.push({ ...update, commits: commits.length });
      }
      cleanup();
      performance.clearMeasures(); performance.clearMarks();
    }
    const detailSummary = {};
    for (const mode of ['mount', 'update']) {
      const values = details[mode];
      const phaseKeys = new Set(values.flatMap(value => Object.keys(value.phases)));
      const siteKeys = new Set(values.flatMap(value => Object.keys(value.sites)));
      timing[`${mode}Phases`] = Object.fromEntries([...phaseKeys].map(key => [key, values.map(value => value.phases[key] ?? 0)]));
      detailSummary[mode] = { commits: frequency(values.map(value => value.commits)),
        phases: Object.fromEntries([...phaseKeys].map(key => [key, metric(timing[`${mode}Phases`][key])])),
        sites: Object.fromEntries([...siteKeys].map(key => [key, {
          time: metric(values.map(value => value.sites[key]?.ms ?? 0)),
          calls: frequency(values.map(value => value.sites[key]?.calls ?? 0)) }])) };
    }
    const lane = renderPhases ? 'react-phases' : render ? 'react' : 'phases';
    const stem = `round-93i-${lane}-${fixtureName}-r${run}-${variant}`;
    environment.endedAt = new Date().toISOString();
    save(`${stem}-timings.json`, timing);
    save(`${stem}-summary.json`, { fixture: fixtureName, run, variant, environment,
      mount: metric(timing.mount), update: metric(timing.update), details: detailSummary,
      observationsSha256: createHash('sha256').update(JSON.stringify(observation)).digest('hex'),
      note: renderPhases ? '65C-01 React 진단: production profiling의 renderRootSync/Concurrent·commitRoot·mutation/layout/passive와 core 경계를 메모리에서만 감싼 배타 phase입니다. 예열·표본·동작은 본 측정과 같습니다. 이 계측 Profiler 시간으로 85C-01을 재판정하지 않습니다.' : render ? '86C-01: production react-dom/profiling + Profiler actualDuration의 모든 mount/update 커밋 합. 같은 BF 폼·상호작용·최종 값·렌더 경로 단언입니다.' :
        '65C-01: 기존 경계의 배타 phase 합. 대기는 제외하고 동기/비동기 정착 완료를 배출합니다. 계측은 시간 판정의 plain 코어와 분리하며 raw에는 시간 배열만 저장합니다.' });
    console.log(`${fixtureName} r${run} ${variant} ${lane}: ${metric(timing.mount).median.toFixed(4)} / ${metric(timing.update).median.toFixed(4)} ms`);
  }
}
