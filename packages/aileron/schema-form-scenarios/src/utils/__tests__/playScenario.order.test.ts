import { describe, expect, it } from 'vitest';

import { playScenario } from '../playScenario';
import { registerScenarioHandle } from '../registerScenarioHandle';

// filid:contract scenario-screen-order
describe('playScenario ordered screen execution', () => {
  it('executes no actions for an empty scenario', async () => {
    const root = document.createElement('div');
    const calls: string[] = [];
    registerScenarioHandle(root, {}, {
      execute: () => { calls.push('execute'); },
      assert: () => { calls.push('assert'); },
    });
    expect(await playScenario({ name: 'empty', schema: {}, steps: [] }, root))
      .toEqual({ executedSteps: 0 });
    expect(calls).toEqual([]);
  });

  it('awaits each action and settlement before checking expectations', async () => {
    const root = document.createElement('div');
    const calls: string[] = [];
    registerScenarioHandle(root, {}, {
      execute: async (step) => { await Promise.resolve(); calls.push(step.action); },
      settle: async () => { await Promise.resolve(); calls.push('settled'); },
      assert: () => { calls.push('assert'); },
    });
    expect(await playScenario({ name: 'ordered', schema: {}, steps: [
      { action: 'setValue', path: '/name', value: 'value', expect: { outputValue: { name: 'value' } } },
      { action: 'reset' },
    ] }, root)).toEqual({ executedSteps: 2 });
    expect(calls).toEqual(['setValue', 'settled', 'assert', 'reset', 'settled']);
  });

  it('propagates assertion failures before running the next action', async () => {
    const root = document.createElement('div');
    const calls: string[] = [];
    registerScenarioHandle(root, {}, {
      execute: (step) => { calls.push(step.action); },
      assert: () => { throw new Error('observable mismatch'); },
    });
    await expect(playScenario({ name: 'failure', schema: {}, steps: [
      { action: 'submit', expect: { outputValue: {} } }, { action: 'reset' },
    ] }, root)).rejects.toThrow('observable mismatch');
    expect(calls).toEqual(['submit']);
  });
});
