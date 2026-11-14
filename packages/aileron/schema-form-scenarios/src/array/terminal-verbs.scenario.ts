import type { FormScenario } from '../types';

/** A terminal array applies all five verbs without creating item nodes. */
export const terminalVerbsScenario = {
  name: 'array.terminal-verbs',
  description: 'TEST-018 NODE-005 NODE-053: terminal arrays apply push, pop, update, remove, and clear.',
  schema: { type: 'array', options: { terminal: true } },
  initialValue: ['a', 'b'],
  steps: [
    { action: 'update', path: '', index: 0, value: 'x', expect: {
      result: 'x', shape: { '/0': 'absent' }, outputValue: ['x', 'b'],
    } },
    { action: 'pop', path: '', expect: { result: 'b', outputValue: ['x'] } },
    { action: 'push', path: '', value: 'z', expect: { result: 2, outputValue: ['x', 'z'] } },
    { action: 'remove', path: '', index: 0, expect: { result: 'x', outputValue: ['z'] } },
    { action: 'clear', path: '', expect: { result: undefined, outputValue: [] } },
  ],
} satisfies FormScenario;
