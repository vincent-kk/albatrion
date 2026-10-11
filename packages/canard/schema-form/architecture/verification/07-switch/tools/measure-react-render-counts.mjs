// Moved from the round-121 scratch proxy-audit/ra.mjs; runtime instrumentation never edits React on disk.
// Usage: node tools/measure-react-render-counts.mjs <head|change|current> [output.json|--counts-only] [--bundle=<file.cjs>]
// --bundle measures a prepared bundle (for example S/bundles/fap-base.cjs) in place of fa-head/fa-change.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import Module, { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareReactBundles } from './prepare-react-bundles.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const scratch = '/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles';
const require = createRequire(resolve(packageRoot, 'package.json'));
const bundleOverride = process.argv.find(value => value.startsWith('--bundle='))?.slice(9);
const [version = 'change', output] = process.argv.slice(2).filter(value => !value.startsWith('--bundle='));
assert(['head', 'change', 'current'].includes(version));
process.env.NODE_ENV = 'production';
const countsOnly = output === '--counts-only';
if (version === 'current') await prepareReactBundles(packageRoot, scratch, 'change');
assert(!bundleOverride || version !== 'current', '--bundle measures an existing bundle; current rebuilds fa-change');
const file = bundleOverride ? resolve(bundleOverride) : resolve(scratch, `fa-${version === 'head' ? 'head' : 'change'}.cjs`);

const nameOf = (type) => {
  if (!type) return 'root';
  if (typeof type === 'string') return 'host:' + type;
  if (typeof type === 'function') return type.displayName || type.name || 'Anonymous';
  if (type.type) return 'memo:' + nameOf(type.type);
  if (type.render) return 'fwd:' + nameOf(type.render);
  return type._context ? 'Consumer' : 'Provider';
};
const pathOf = (fiber) => {
  for (let current = fiber; current; current = current.return) {
    const props = current.pendingProps ?? current.memoizedProps;
    if (!props || typeof props !== 'object') continue;
    if (props.node && typeof props.node.path === 'string') return props.node.path;
    if (typeof props['data-path'] === 'string') return props['data-path'];
    if (typeof props.path === 'string') return props.path;
  }
  return '(form)';
};
let counting = false;
let log = [];
globalThis.__faRender = (current, fiber, component) => {
  if (counting) log.push({ kind: 'render', component: nameOf(fiber.elementType ?? component),
    path: pathOf(fiber), mount: !current });
};
globalThis.__faClass = (fiber, current) => {
  if (counting) log.push({ kind: 'render', component: 'class:' + nameOf(fiber.type),
    path: pathOf(fiber), mount: !current });
};
globalThis.__faBegin = (fiber, current) => {
  if (counting) log.push({ kind: 'visit', component: nameOf(fiber.type),
    path: pathOf(fiber), mount: !current });
};
globalThis.__faCommit = () => { if (counting) log.push({ kind: 'commit' }); };
const originalLoader = Module._extensions['.js'];
const replaceOnce = (source, before, after) => {
  assert.equal(source.split(before).length, 2, `React instrumentation anchor: ${before}`);
  return source.replace(before, after);
};
Module._extensions['.js'] = (module, filename) => {
  if (!/react-dom-profiling\.profiling\.js$/.test(filename)) return originalLoader(module, filename);
  let source = readFileSync(filename, 'utf8');
  source = replaceOnce(source, '  nextRenderLanes\n) {\n  renderLanes = nextRenderLanes;',
    '  nextRenderLanes\n) {\n  globalThis.__faRender(current, workInProgress, Component);\n  renderLanes = nextRenderLanes;');
  source = replaceOnce(source, ': (Component = context.render()),',
    ': (globalThis.__faClass(workInProgress, current), (Component = context.render())),');
  source = replaceOnce(source, 'function beginWork(current, workInProgress, renderLanes) {',
    'function beginWork(current, workInProgress, renderLanes) {\n  globalThis.__faBegin(workInProgress, current);');
  source = replaceOnce(source, '\nfunction commitRoot(',
    '\nfunction commitRoot(...args) { globalThis.__faCommit(); return commitRoot$fa(...args); }\nfunction commitRoot$fa(');
  module._compile(source, filename);
};
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'Element', 'HTMLElement', 'HTMLInputElement', 'Event'])
  Object.defineProperty(globalThis, key, { configurable: true, writable: true,
    value: key === 'window' ? dom.window : dom.window[key] });
const api = require(file);
const { flushSync } = require('react-dom');
const drain = async () => {
  for (let index = 0; index < 4; index++) await new Promise((done) => setImmediate(done));
};
let latency = null;
const reflectHostValue = () => {
  if (!latency || latency.us !== null) return;
  const input = latency.container.querySelector(`[data-path="${latency.path}"] input`);
  if (input?.isConnected && input.value === latency.value)
    latency.us = (performance.now() - latency.start) * 1000;
};
// Observe the real setter/placement immediately inside the host mutation, never a later timer.
const inputValue = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value');
Object.defineProperty(dom.window.HTMLInputElement.prototype, 'value', { ...inputValue,
  set(value) { inputValue.set.call(this, value); reflectHostValue(); } });
for (const method of ['appendChild', 'insertBefore']) {
  const original = dom.window.Node.prototype[method];
  dom.window.Node.prototype[method] = function (...args) {
    const result = Reflect.apply(original, this, args);
    reflectHostValue();
    return result;
  };
}
const scenarios = [];
for (const scenario of countsOnly ? ['flat'] : ['flat', 'array']) {
  for (const mode of ['ctl', 'unctl']) {
    const mounted = api.mount(mode, scenario);
    await drain();
    const handle = () => mounted.ref.current;
    const fibers = {};
    const visit = (fiber) => {
      const path = pathOf(fiber);
      const record = fibers[path] ??= { total: 0, components: {} };
      record.total++;
      const component = nameOf(fiber.elementType ?? fiber.type);
      record.components[component] = (record.components[component] ?? 0) + 1;
      for (let child = fiber.child; child; child = child.sibling) visit(child);
    };
    visit(mounted.root._internalRoot.current);
    const leafPaths = scenario === 'flat' ? ['/a', '/b', '/o/x', '/o/y'] : ['/arr/0', '/arr/1', '/arr/2'];
    const write = (label, target, run) => ({ label, target, run });
    const writes = scenario === 'flat' ? [
      write('input write /a', '/a', () => api.registry.get('/a')('a1')),
      write('input write /a again', '/a', () => api.registry.get('/a')('a12')),
      write('sibling setValue /b', '/b', () => handle().findNode('/b').setValue('b1')),
      write('same-value setValue /b', '/b', () => handle().findNode('/b').setValue('b1')),
      write('parent setValue /o (x only)', '/o/x', () => handle().findNode('/o').setValue({ x: 'x1', y: 'y0' })),
      write('whole setValue (a only)', '/a', () => handle().setValue({ ...handle().getValue(), a: 'aw' })),
      write('refresh /a', '/a', () => handle().refresh('/a')),
      ...(countsOnly ? [] : [
        write('showError(true)', null, () => handle().showError(true)),
        write('Form context prop change', null, () => api.setHostProps({ context: { k: 2 } })),
        write('Form re-render, new inline onChange', null, () => api.setHostProps({ onChange: () => {} })),
        write('Form readOnly prop true', null, () => api.setHostProps({ readOnly: true })),
        write('reset()', null, () => handle().reset()),
      ]),
    ] : [
      write('push', '/arr', () => handle().findNode('/arr').push('n0')),
      write('push again', '/arr', () => handle().findNode('/arr').push('n1')),
      write('remove(0)', '/arr', () => handle().findNode('/arr').remove(0)),
      write('remove(last)', '/arr', () => handle().findNode('/arr').remove(handle().findNode('/arr').value.length - 1)),
      write('replace setValue (+1 item)', '/arr', () => handle().findNode('/arr').setValue([...handle().findNode('/arr').value, 'r'])),
      write('replace setValue (all new values)', '/arr', () => handle().findNode('/arr').setValue(['z0', 'z1', 'z2', 'z3'])),
    ];
    const results = [];
    for (const operation of writes) {
      const before = [...mounted.container.querySelectorAll('[data-path]')].map(element => element.getAttribute('data-path'));
      log = []; counting = true;
      flushSync(operation.run);
      await drain();
      counting = false;
      const renders = log.filter(event => event.kind === 'render');
      const byPath = {}, byComponent = {};
      for (const event of renders) {
        byPath[event.path] = (byPath[event.path] ?? 0) + 1;
        const paths = byComponent[event.component] ??= {};
        paths[event.path] = (paths[event.path] ?? 0) + 1;
      }
      const rawMounts = renders.filter(event => event.mount && /^(CtlInput|UnctlInput)$/.test(event.component));
      results.push({ write: operation.label, target: operation.target,
        commits: log.filter(event => event.kind === 'commit').length,
        renders: { total: renders.length, byPath, byComponent },
        fibersVisited: log.filter(event => event.kind === 'visit').length,
        fibersCreated: log.filter(event => event.kind === 'visit' && event.mount).length,
        remounts: rawMounts.filter(event => before.includes(event.path)).map(event => event.path),
        newMounts: rawMounts.filter(event => !before.includes(event.path)).map(event => event.path) });
    }
    const samples = [];
    if (!countsOnly) {
      const path = scenario === 'flat' ? '/a' : '/arr/0';
      for (let index = 0; index < 8; index++) {
        const value = `host-update-${index}`;
        const node = handle().findNode(path);
        latency = { container: mounted.container, path, value, us: null, start: null };
        flushSync(() => {
          latency.start = performance.now();
          node.setValue(value);
        });
        assert.notEqual(latency.us, null, `in-commit host update missing: ${mode}/${scenario}`);
        samples.push(latency.us);
        latency = null;
        await drain();
      }
    }
    const sorted = [...samples].sort((a, b) => a - b);
    scenarios.push({ scenario, mode, fibersPerField: Object.fromEntries(leafPaths.map(path => [path, fibers[path].total])),
      fibersByPath: fibers, writes: results,
      refreshLatency: countsOnly ? null : { unit: 'µs', endpoint: 'in-commit DOM input value setter/placement',
        operation: 'external leaf setValue (automatic Refresh)', iterations: samples.length,
        median: (sorted[3] + sorted[4]) / 2, min: sorted[0], max: sorted.at(-1), samples } });
    mounted.unmount();
  }
}
Module._extensions['.js'] = originalLoader;
dom.window.close();
const report = { version, revision: bundleOverride ? 'prepared bundle (see its preparation record)' : version === 'head' ? '087e5618e' : 'working',
  bundle: file, sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
  production: true, instrumentation: 'React runtime function/class invocations and fiber tree; bundles unchanged',
  timingBenchmark: false, scenarios };
if (output && !countsOnly) writeFileSync(resolve(output), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
