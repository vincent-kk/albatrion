import type { FormScenario } from '../../types';

/** An array of objects edited by several verbs inside one batch. */
const peopleSchema = {
  type: 'object',
  properties: { people: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' } } } } },
};

/** One batch of array verbs settles once as a whole write of its host, so item identity follows position. */
export const batchVerbsScenario: FormScenario = {
  name: 'structure.batch-verbs-positional-identity',
  description: 'EVENT-013 and NODE-051 62C-01: array verbs inside a batch mark one whole write that settles once (one change callback), and item identity is reconciled by position, which may differ from sequential calls; GOAL-010 a batch counts as one write.',
  schema: peopleSchema,
  initialValue: { people: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] },
  steps: [
    { action: 'batch', steps: [
      { action: 'push', path: '/people', value: { name: 'd' } },
      { action: 'remove', path: '/people', index: 0 },
      { action: 'update', path: '/people', index: 0, value: { name: 'B' } },
    ], expect: {
      onChangeCount: 1, identity: { '/people/0': '/people/0', '/people/1': '/people/1', '/people/2': '/people/2' },
      shape: { '/people/2': 'present', '/people/3': 'absent' },
      outputValue: { people: [{ name: 'B' }, { name: 'c' }, { name: 'd' }] },
    } },
    { action: 'setValue', path: '/people/1/name', value: 'C', expect: {
      identity: { '/people/1': '/people/1' }, outputValue: { people: [{ name: 'B' }, { name: 'C' }, { name: 'd' }] },
    } },
  ],
};
