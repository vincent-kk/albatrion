import type { FormScenario } from '../../types';

/** A kind discriminator with a tag list in one branch. */
const listSchema = {
  type: 'object', controls: { discriminator: 'kind' }, required: ['kind'],
  oneOf: [
    { properties: { kind: { const: 'list' }, tags: { type: 'array', items: { type: 'string' } } } },
    { properties: { kind: { const: 'single' }, tag: { type: 'string' } } },
  ],
};

/** Regression (from CX-08): a write that grows an array while the same write closes its branch keeps the new item value. */
export const batchPushIntoClosingBranchScenario: FormScenario = {
  name: 'composite.batch-push-into-closing-branch',
  description: 'A batch is one whole write of its composed value (EVENT-013), and a whole write makes the value at every path in V that path\'s new raw value, latent or not (LANDING-018). So batch[push "d", kind = single] and the equivalent whole write {kind: "single", tags: [a, b, c, d]} restore four rows ending in "d" when the list branch returns, as a push and a switch in separate entries do.',
  schema: listSchema,
  initialValue: { kind: 'list', tags: ['a', 'b', 'c'] },
  steps: [
    { action: 'batch', steps: [{ action: 'push', path: '/tags', value: 'd' }, { action: 'setValue', path: '/kind', value: 'single' }], expect: { shape: { '/tags': 'absent' } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'list' }], expect: { values: { '/tags': ['a', 'b', 'c', 'd'] } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '', value: { kind: 'single', tags: ['a', 'b', 'c', 'd', 'e'] } }], expect: { shape: { '/tags': 'absent' } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'list' }], expect: { values: { '/tags': ['a', 'b', 'c', 'd', 'e'] } } },
  ],
};
