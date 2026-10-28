// Smoke and diagnostic imports use this clock-free counter, never a sample timer.
import assert from 'node:assert/strict';

export function createUntimedRecorder() {
  const stack = [];
  const recorder = {
    enabled: false,
    metrics: {},
    enter(name) {
      if (!recorder.enabled) return;
      const token = { name };
      stack.push(token);
      return token;
    },
    enterCreation(name) {
      return recorder.enter(name);
    },
    exit(token) {
      if (!token) return;
      assert.equal(stack.pop(), token);
      recorder.metrics[token.name] = (recorder.metrics[token.name] ?? 0) + 1;
    },
    reset() {
      assert.equal(stack.length, 0);
      recorder.metrics = {};
    },
  };
  return recorder;
}
