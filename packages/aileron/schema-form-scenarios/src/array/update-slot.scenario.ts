import type { FormScenario } from '../types';

/** An item update preserves its identity and existing snapshot. */
export const updateSlotScenario = {
  name: 'array.update-slot',
  description: 'TEST-018 NODE-051 WRITE-095: update writes a position without changing its key or snapshot.',
  schema: { type: 'array', items: { type: 'string' } },
  initialValue: ['a'],
  steps: [{ action: 'update', path: '', index: 0, value: 'x', expect: {
    result: 'x', identity: { '/0': '/0' }, defaultValues: { '/0': 'a' },
    outputValue: ['x'],
  } }],
} satisfies FormScenario;
