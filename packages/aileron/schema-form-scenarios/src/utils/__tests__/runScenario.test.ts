import { describe, expect, it } from 'vitest';

import type { FormScenario } from '../../types';
import { runScenario } from '../runScenario';

// filid:contract scenario-runner
describe('runScenario', () => {
  it('executes an empty scenario without calling the adapter', async () => {
    const calls: string[] = [];
    const result = await runScenario(
      { name: 'empty', schema: {}, steps: [] },
      { execute: () => { calls.push('execute'); }, assert: () => { calls.push('assert'); } },
    );
    expect(result).toEqual({ executedSteps: 0 });
    expect(calls).toEqual([]);
  });

  it('awaits actions and completion before checking expectations', async () => {
    const calls: string[] = [];
    const scenario: FormScenario = {
      name: 'ordered', schema: {}, steps: [
        { action: 'setValue', path: '/name', value: 'value', expect: { outputValue: { name: 'value' } } },
        { action: 'reset' },
      ],
    };
    const result = await runScenario(scenario, {
      execute: async (step) => { await Promise.resolve(); calls.push(step.action); },
      settle: async () => { await Promise.resolve(); calls.push('settled'); },
      assert: () => { calls.push('assert'); },
    });
    expect(result).toEqual({ executedSteps: 2 });
    expect(calls).toEqual(['setValue', 'settled', 'assert', 'reset', 'settled']);
  });

  it('propagates an assertion failure and stops before the next action', async () => {
    const calls: string[] = [];
    await expect(runScenario({ name: 'failure', schema: {}, steps: [
      { action: 'submit', expect: { outputValue: {} } }, { action: 'reset' },
    ] }, {
      execute: (step) => { calls.push(step.action); },
      assert: () => { throw new Error('observable mismatch'); },
    })).rejects.toThrow('observable mismatch');
    expect(calls).toEqual(['submit']);
  });
});
