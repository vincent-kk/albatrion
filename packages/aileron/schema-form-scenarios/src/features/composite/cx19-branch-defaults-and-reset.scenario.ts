import type { CompositeCase } from './types';

/** Two plans with their own defaults. */
const planSchema = {
  type: 'object', controls: { discriminator: 'plan' }, required: ['plan'],
  oneOf: [
    { properties: { plan: { const: 'a' }, size: { type: 'string', default: 'small' } } },
    { properties: { plan: { const: 'b' }, color: { type: 'string', default: 'red' } } },
  ],
};

/** CX-19: reset returns to the loaded branch and its defaults, dropping the other branch's edits. */
export const cx19BranchDefaultsAndReset: CompositeCase = {
  scenario: {
    name: 'composite.cx19-branch-defaults-and-reset',
    description: 'Defaults fill once when a branch node is created (LANDING-011); an edit in branch b is retained while b is closed (LANDING-018) but reset is a new load (WRITE-044) that drops retained raw values, so after reset branch a shows its default and switching to b fills b\'s default again.',
    schema: planSchema,
    initialValue: { plan: 'a' },
    steps: [
      { action: 'batch', steps: [], expect: { values: { '/size': 'small' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/plan', value: 'b' }], expect: { values: { '/color': 'red' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/color', value: 'blue' }], expect: { values: { '/color': 'blue' } } },
      { action: 'reset', expect: { shape: { '/size': 'present', '/color': 'absent' }, values: { '/plan': 'a', '/size': 'small' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/plan', value: 'b' }], expect: { values: { '/color': 'red' } } },
    ],
  },
};
