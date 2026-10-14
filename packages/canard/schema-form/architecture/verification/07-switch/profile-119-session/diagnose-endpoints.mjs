// CLI diagnostic; controls separate sentinel tail, forced GC, and engine callbacks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PerformanceObserver } from 'node:perf_hooks';
import { scratch, req, bfReq, clocks, median, hash, emit } from './runtime.mjs';

assert(globalThis.gc);
const start = performance.now();
const text = fs.readFileSync(path.join(scratch, 'b-head.cjs'), 'utf8');
const module = { exports: {} };
new Function('require', 'module', 'exports', text)(bfReq, module, module.exports);
const engine = module.exports;
const { measureCall, flushMicrotasks } = clocks(1);
const noop = () => {};
const rows = [], gcEvents = [], windows = [];
const observer = new PerformanceObserver(list => gcEvents.push(...list.getEntries().map(event => ({ start: event.startTime, ms: event.duration }))));
observer.observe({ entryTypes: ['gc'] });
for (const fixtureName of ['sample-0', 'sample-1', 'sample-2', 'flat-50']) {
  const fixture = engine.equivalentFixtures.find(row => row.name === fixtureName);
  assert(fixture);
  for (const control of ['engine-gc', 'engine-no-gc', 'cpu-gc', 'noop-gc']) {
    const samples = [];
    globalThis.gc();
    for (let index = -20; index < 101; index++) {
      assert(performance.now() - start < 400000);
      const prepared = { jsonSchema: structuredClone(fixture.workspace), validationMode: 0, onChange: noop };
      if (control !== 'engine-no-gc') globalThis.gc();
      await new Promise(resolve => setImmediate(resolve));
      const emptyStart = performance.now(), empty = await measureCall(noop), emptyEnd = performance.now();
      const operation = control.startsWith('engine') ? () => engine.nodeFromJSONSchema(prepared)
        : control === 'cpu-gc' ? () => { const until = performance.now() + .25; while (performance.now() < until) {} } : noop;
      const begin = performance.now(), observed = await measureCall(operation), end = performance.now();
      const after = await measureCall(noop);
      if (index >= 0) {
        samples.push({ microMs: observed.timing[0], emptyTailMs: empty.timing[1] - empty.timing[0],
          actualTailMs: observed.timing[1] - observed.timing[0], afterTailMs: after.timing[1] - after.timing[0] });
        windows.push({ fixtureName, control, index, emptyStart, emptyEnd, begin, end });
      }
    }
    rows.push({ fixtureName, control, samples });
    console.log(fixtureName + ' ' + control + ': 20 warmup + 101 samples finished');
  }
}
await new Promise(resolve => setImmediate(resolve));
observer.disconnect();
const scheduler = req('@winglet/common-utils/scheduler');
const native = scheduler.scheduleMacrotaskSafe;
const boundary = { scheduled: 0, executed: 0, afterSentinel: 0 };
scheduler.scheduleMacrotaskSafe = (callback, ...args) => {
  boundary.scheduled++;
  return native((...values) => { boundary.executed++; return callback(...values); }, ...args);
};
try {
  for (const fixtureName of ['sample-0', 'sample-1', 'sample-2', 'flat-50']) {
    const fixture = engine.equivalentFixtures.find(row => row.name === fixtureName);
    engine.nodeFromJSONSchema({ jsonSchema: structuredClone(fixture.workspace), validationMode: 0, onChange: noop });
    await flushMicrotasks(); await new Promise(resolve => setImmediate(resolve));
    const before = boundary.executed;
    await flushMicrotasks(128); await new Promise(resolve => setImmediate(resolve));
    boundary.afterSentinel += boundary.executed - before;
  }
} finally { scheduler.scheduleMacrotaskSafe = native; }
assert.equal(boundary.scheduled + boundary.executed + boundary.afterSentinel, 0);
const summary = rows.map(row => ({ fixture: row.fixtureName, control: row.control,
  microUs: median(row.samples.map(s => s.microMs)) * 1000,
  emptyTailUs: median(row.samples.map(s => s.emptyTailMs)) * 1000,
  actualTailUs: median(row.samples.map(s => s.actualTailMs)) * 1000,
  afterTailUs: median(row.samples.map(s => s.afterTailMs)) * 1000,
  pairedDifferenceUs: median(row.samples.map(s => s.actualTailMs - s.emptyTailMs)) * 1000,
  gcInEmpty: gcEvents.filter(e => windows.some(w => w.fixtureName === row.fixtureName && w.control === row.control && e.start >= w.emptyStart && e.start < w.emptyEnd)).length,
  gcInEngine: gcEvents.filter(e => windows.some(w => w.fixtureName === row.fixtureName && w.control === row.control && e.start >= w.begin && e.start < w.end)).length }));
emit('endpoint-diagnostic.json', { started: new Date(Date.now() - performance.now() + start).toISOString(), ended: new Date().toISOString(),
  seconds: (performance.now() - start) / 1000, bundleSha256: hash(text), rows, summary, boundary, gcEvents });
console.log(JSON.stringify(summary));
