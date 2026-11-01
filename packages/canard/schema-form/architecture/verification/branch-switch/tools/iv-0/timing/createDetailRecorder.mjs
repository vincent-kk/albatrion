import assert from 'node:assert/strict';

import { createSlotRecorder } from '../../b4-2/recorder.mjs';
import { ledgerNames } from '../../b9-0/buildStages.mjs';

/**
 * Add clock-free parent attribution to the established nested timer implementation.
 * @returns Recorder with disjoint metrics and scoped helper self costs
 */
export function createDetailRecorder() {
  const recorder = createSlotRecorder();
  const enter = recorder.enter.bind(recorder),
    exit = recorder.exit.bind(recorder),
    reset = recorder.reset.bind(recorder);
  const stack = [];
  recorder.scoped = {};
  recorder.enter = (name, gate) => {
    const token = enter(name, gate);
    if (token) {
      token.owner =
        stack.findLast((entry) => ledgerNames.includes(entry.name))?.name ??
        'other';
      stack.push(token);
    }
    return token;
  };
  recorder.exit = (token) => {
    if (!token) return;
    assert.equal(stack.pop(), token);
    const previous = recorder.metrics[token.name]?.selfUs ?? 0;
    exit(token);
    const entry = (recorder.scoped[token.owner + '/' + token.name] ??= {
      selfUs: 0,
      calls: 0,
    });
    entry.selfUs += recorder.metrics[token.name].selfUs - previous;
    entry.calls++;
  };
  recorder.reset = () => {
    reset();
    assert.equal(stack.length, 0);
    recorder.scoped = {};
  };
  return recorder;
}
