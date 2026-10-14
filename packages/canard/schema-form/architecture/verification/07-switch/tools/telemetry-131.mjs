import { performance, PerformanceObserver } from 'node:perf_hooks';

/** Observe GC without altering clocks and attribute inclusive stage costs; finish outside all sample windows. */
export function telemetry131(firstForm) {
  const formStart = performance.now(), entries = [], windows = {};
  const time = { startToReadyMs: 0, warmupMs: 0, forcedGcMs: 0, minorGcMs: 0, sampleMs: 0, digestMs: 0, calibrationMs: 0 };
  let observer = null;
  const collect = records => entries.push(...records.map(entry => ({
    start: entry.startTime, end: entry.startTime + entry.duration, kind: entry.detail.kind })));
  const sync = (name, action) => {
    const start = performance.now();
    try { return action(); } finally { time[name] += performance.now() - start; }
  };
  return { time,
    start() {
      if (observer) throw new Error('GC observation already started');
      observer = new PerformanceObserver(list => collect(list.getEntries()));
      observer.observe({ entryTypes: ['gc'] });
    },
    async stop() {
      if (!observer) return;
      // Drain deferred observer callbacks before any later forced-GC pass or control window.
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setImmediate(resolve));
      collect(observer.takeRecords());
      observer.disconnect();
      observer = null;
    },
    ready() { time.startToReadyMs = firstForm ? performance.now() : performance.now() - formStart; },
    async run(name, action) { const start = performance.now(); try { return await action(); } finally { time[name] += performance.now() - start; } },
    digest(action) { return sync('digestMs', action); },
    gc(minor = false) { return sync(minor ? 'minorGcMs' : 'forcedGcMs', () => minor ? globalThis.gc({ type: 'minor', execution: 'sync' }) : globalThis.gc()); },
    window(column, spans, index, writes = column.includes('mount') ? [] : spans) {
      if (observer && column.endsWith('-nogc') && index >= 0) (windows[column] ??= []).push({ spans, writes });
    },
    async finish() {
      await this.stop();
      const overlaps = spans => spans.filter(([start, end]) => entries.some(entry => entry.start < end && entry.end > start)).length;
      const gc = Object.fromEntries(Object.entries(windows).map(([column, samples]) => [column, samples.map(({ spans, writes }) => ({
        windows: spans.length, windowsWithGc: overlaps(spans), writeWindows: writes.length, writeWindowsWithGc: overlaps(writes),
      }))]));
      return { time: { ...time, launchBeforeFormMs: firstForm ? formStart : 0, formElapsedMs: performance.now() - formStart }, gc,
        gcMethod: 'perf_hooks observer active only in the no-GC pass; forced-GC observations are null; stage times include nested GC/digest costs' };
    },
  };
}
