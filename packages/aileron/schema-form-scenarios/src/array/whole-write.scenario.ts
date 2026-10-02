import type { FormScenario } from '../types';

/** Whole writes reuse positions and leave a new trailing snapshot slot empty. */
export const wholeWriteScenario = {
  name: 'array.whole-write',
  description: 'NODE-051 NODE-053 WRITE-095: a whole write reuses positions and creates an undefined snapshot slot.',
  schema: { type: 'array', items: { type: 'string' } },
  initialValue: ['a'],
  steps: [{ action: 'setValue', path: '', value: ['x', 'y'], expect: {
    identity: { '/0': '/0' }, shape: { '/1': 'present' },
    defaultValues: { '/0': 'a', '/1': undefined }, outputValue: ['x', 'y'],
  } }],
} satisfies FormScenario;
