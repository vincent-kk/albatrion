import assert from 'node:assert/strict';

import { createSlotRecorder } from '../../b4-2/recorder.mjs';
import { stageNames as baseStageNames } from '../../b6/buildStages.mjs';

/** Additional ancestry accounting reads existing tokens; it does not add clocks. */
export function createScopedRecorder() {
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
        stack.findLast((frame) => baseStageNames.includes(frame.name))?.name ??
        'other';
      if (name === 'writeFieldNode' && recorder.writeStart === undefined)
        recorder.writeStart = token.start;
      stack.push(token);
    }
    return token;
  };
  recorder.exit = (token) => {
    if (!token) return;
    assert.equal(stack.pop(), token);
    const before = recorder.metrics[token.name]?.selfUs ?? 0;
    const beforeIncl = recorder.metrics[token.name]?.inclusiveUs ?? 0;
    exit(token);
    const metric = (recorder.scoped[token.owner + '/' + token.name] ??= {
      selfUs: 0,
      inclusiveUs: 0,
      calls: 0,
    });
    metric.selfUs += recorder.metrics[token.name].selfUs - before;
    metric.inclusiveUs += recorder.metrics[token.name].inclusiveUs - beforeIncl;
    metric.calls++;
  };
  recorder.reset = () => {
    reset();
    assert.equal(stack.length, 0);
    recorder.scoped = {};
    recorder.writeStart = undefined;
  };
  return recorder;
}
