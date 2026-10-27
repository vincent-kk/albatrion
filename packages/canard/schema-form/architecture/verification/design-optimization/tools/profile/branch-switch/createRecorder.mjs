import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

/** Create the runtime injected into scratch bundles; timers partition nested functions without double counting. */
export function createRecorder() {
  const stack = [];
  const ids = new WeakMap();
  let nextId = 0;
  const recorder = {
    enabled: false,
    diagnostic: false,
    gate: undefined,
    metrics: {},
    phaseMetrics: {},
    events: [],
    enter(name, gate) {
      if (!recorder.enabled && !recorder.diagnostic) return undefined;
      const token = {
        name,
        phase:
          stack[0]?.phase ??
          ([
            'markWrite',
            'registerRecalculation',
            'computeNode',
            'runDeriveRounds',
            'transitionSettlement',
            'finalizeExits',
            'commitSettlement',
          ].includes(name)
            ? name
            : 'everythingElse'),
        start: performance.now(),
        child: 0,
        gate: recorder.gate,
      };
      if (gate) recorder.gate = gate;
      stack.push(token);
      return token;
    },
    exit(token) {
      if (!token) return;
      const elapsed = performance.now() - token.start;
      assert.equal(stack.pop(), token, 'Unbalanced instrumentation');
      recorder.gate = token.gate;
      if (stack.length) stack.at(-1).child += elapsed;
      const metric = (recorder.metrics[token.name] ??= {
        inclusiveUs: 0,
        selfUs: 0,
        calls: 0,
      });
      metric.inclusiveUs += elapsed * 1000;
      metric.selfUs += (elapsed - token.child) * 1000;
      metric.calls++;
      const phaseMetric = (recorder.phaseMetrics[
        `${token.phase}/${token.name}`
      ] ??= { inclusiveUs: 0, selfUs: 0, calls: 0 });
      phaseMetric.inclusiveUs += elapsed * 1000;
      phaseMetric.selfUs += (elapsed - token.child) * 1000;
      phaseMetric.calls++;
    },
    mismatch(frame, key, previous, input) {
      if (!recorder.diagnostic) return;
      for (const value of [frame, previous.value, input.value])
        if (value !== null && typeof value === 'object' && !ids.has(value))
          ids.set(value, ++nextId);
      recorder.events.push({
        frame: ids.get(frame),
        key,
        kind: input.kind,
        gate: recorder.gate,
        previous:
          previous.value === undefined
            ? '<undefined>'
            : structuredClone(previous.value),
        next:
          input.value === undefined
            ? '<undefined>'
            : structuredClone(input.value),
        previousIdentity:
          previous.value !== null && typeof previous.value === 'object'
            ? ids.get(previous.value)
            : null,
        nextIdentity:
          input.value !== null && typeof input.value === 'object'
            ? ids.get(input.value)
            : null,
        sameIdentity: Object.is(previous.value, input.value),
      });
    },
    reset() {
      assert.equal(stack.length, 0);
      recorder.metrics = {};
      recorder.phaseMetrics = {};
      recorder.events = [];
    },
  };
  return recorder;
}
