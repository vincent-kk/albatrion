import type { FormScenario } from '../types';

/** Clearing an array cuts all item and snapshot slots. */
export const clearSlotsScenario = {
  name: 'array.clear-slots',
  description: 'TEST-018 NODE-051 WRITE-095 VALUE-034: clear leaves an empty root array.',
  schema: { type: 'array', items: { type: 'string' } },
  initialValue: ['a', 'b'],
  steps: [{ action: 'clear', path: '', expect: {
    result: undefined, shape: { '/0': 'absent', '/1': 'absent' },
    defaultValues: { '': [] }, values: { '': [] }, outputValue: [],
  } }],
} satisfies FormScenario;
