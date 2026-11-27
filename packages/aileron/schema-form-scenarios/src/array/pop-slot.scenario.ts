import type { FormScenario } from '../types';

/** Popping cuts the last item and its snapshot slot. */
export const popSlotScenario = {
  name: 'array.pop-slot',
  description: 'TEST-018 NODE-051 WRITE-095: pop removes only the trailing slot.',
  schema: { type: 'array', items: { type: 'string' } },
  initialValue: ['a', 'b'],
  steps: [{ action: 'pop', path: '', expect: {
    result: 'b', identity: { '/0': '/0' }, shape: { '/1': 'absent' },
    defaultValues: { '': ['a'] }, outputValue: ['a'],
  } }],
} satisfies FormScenario;
