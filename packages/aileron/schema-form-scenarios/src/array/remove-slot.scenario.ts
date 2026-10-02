import type { FormScenario } from '../types';

/** Removing a leading item shifts surviving references and snapshot slots. */
export const removeSlotScenario = {
  name: 'array.remove-slot',
  description: 'TEST-018 NODE-051 WRITE-095: remove shifts references and cuts a snapshot slot.',
  schema: { type: 'array', items: { type: 'string' } },
  initialValue: ['a', 'b', 'c'],
  steps: [{ action: 'remove', path: '', index: 0, expect: {
    result: 'a', identity: { '/0': '/1', '/1': '/2' }, shape: { '/2': 'absent' },
    defaultValues: { '': ['b', 'c'], '/0': 'b', '/1': 'c' }, outputValue: ['b', 'c'],
  } }],
} satisfies FormScenario;
