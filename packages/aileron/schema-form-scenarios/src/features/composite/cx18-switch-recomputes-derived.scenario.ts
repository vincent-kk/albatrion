import type { CompositeCase } from './types';

/** Two shipping branches: total is declared in both (one shared node), eta only in express (a new node there). */
const shippingSchema = {
  type: 'object', controls: { discriminator: 'ship' }, required: ['ship'],
  properties: { base: { type: 'number' } },
  oneOf: [
    { properties: { ship: { const: 'standard' }, fee: { type: 'number' }, total: { type: 'number', controls: { derived: '../base + ../fee' } } } },
    { properties: { ship: { const: 'express' }, rush: { type: 'number' }, total: { type: 'number', controls: { derived: '../base + ../rush * 2' } },
      eta: { type: 'number', controls: { derived: '../rush + 1' } } } },
  ],
};

/** CX-18: a branch switch fires the new branch's derived rule on new nodes only; a shared node waits for an edge. */
export const cx18SwitchRecomputesDerived: CompositeCase = {
  scenario: {
    name: 'composite.cx18-switch-recomputes-derived',
    description: 'FRAGMENT-050 a fragment rule is a candidate only while its fragment is on: a node the switch newly brings in fires false → true (eta derives at once), while a node both branches declare keeps its value and only takes the new baseline (total stays 13) until a dependency of the active rule changes (CONTROLS-026); a manual total edit stands until that edge; switching back again keeps the shared total until fee changes.',
    schema: shippingSchema,
    initialValue: { ship: 'standard', base: 10, fee: 3, rush: 4 },
    steps: [
      { action: 'batch', steps: [], expect: { values: { '/total': 13 } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/ship', value: 'express' }], expect: { values: { '/total': 13, '/eta': 5 } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/total', value: 99 }], expect: { values: { '/total': 99 } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/rush', value: 5 }], expect: { values: { '/total': 20, '/eta': 6 } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/ship', value: 'standard' }], expect: { values: { '/total': 20 }, shape: { '/eta': 'absent' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/fee', value: 4 }], expect: { values: { '/total': 14 } } },
    ],
  },
};
