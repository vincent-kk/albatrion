import assert from 'node:assert/strict';

/** Inject the clock; null records calls without reading any clock or taking samples. */
export function createMountRecorder(clock, recordPointers = false) {
  const stack = [];
  const recorder = {
    enabled: true,
    metrics: {},
    scopedMetrics: {},
    phases: {},
    pointers: {},
    enter(name, phase, pointer) {
      if (!recorder.enabled) return undefined;
      const parser = phase === 'pointerParsing';
      if (parser) phase = stack.at(-1)?.phase ?? phase;
      const token = { name, phase, parser, child: 0, start: clock?.() };
      if (recordPointers && typeof pointer === 'string') {
        const caller = stack.at(-1)?.name ?? '<operation>';
        const owner =
          stack.findLast((frame) => !frame.parser)?.name ?? '<operation>';
        const key = JSON.stringify([name, caller, owner, pointer]);
        recorder.pointers[key] = (recorder.pointers[key] ?? 0) + 1;
      }
      stack.push(token);
      return token;
    },
    exit(token) {
      if (!token) return;
      const elapsed = clock ? (clock() - token.start) * 1000 : 0;
      assert.equal(stack.pop(), token, 'Balanced mount instrumentation');
      if (stack.length) stack.at(-1).child += elapsed;
      for (const [map, key] of [
        [recorder.metrics, token.name],
        [recorder.phases, token.phase],
        [recorder.scopedMetrics, token.phase + '/' + token.name],
      ]) {
        const metric = (map[key] ??= { selfUs: 0, inclusiveUs: 0, calls: 0 });
        metric.selfUs += elapsed - token.child;
        metric.inclusiveUs += elapsed;
        metric.calls++;
      }
    },
    snapshot() {
      assert.equal(stack.length, 0, 'No outstanding mount frames');
      return structuredClone({
        timed: clock !== null,
        totalUs: Object.values(recorder.phases).reduce(
          (sum, metric) => sum + metric.selfUs,
          0,
        ),
        metrics: recorder.metrics,
        scopedMetrics: recorder.scopedMetrics,
        phases: recorder.phases,
        pointers: recorder.pointers,
      });
    },
    reset() {
      assert.equal(stack.length, 0);
      recorder.metrics = {};
      recorder.scopedMetrics = {};
      recorder.phases = {};
      recorder.pointers = {};
    },
  };
  return recorder;
}
