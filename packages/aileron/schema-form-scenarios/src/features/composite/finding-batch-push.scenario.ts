import type { FormScenario } from '../../types';

/** A kind discriminator with a tag list in one branch. */
const listSchema = {
  type: 'object', controls: { discriminator: 'kind' }, required: ['kind'],
  oneOf: [
    { properties: { kind: { const: 'list' }, tags: { type: 'array', items: { type: 'string' } } } },
    { properties: { kind: { const: 'single' }, tag: { type: 'string' } } },
  ],
};

/**
 * Finding (07c composite, from CX-08): a write that grows an array while the same write closes its branch keeps the new
 * length but loses the new item's value. The expectations state the ledger contract, so this scenario fails until fixed.
 */
export const batchPushFindingScenario: FormScenario = {
  name: 'composite.finding-batch-push-into-closing-branch',
  description: 'Finding: a batch is one whole write of its composed value (EVENT-013), and a whole write makes the value at every path in V that path\'s new raw value, latent or not (LANDING-018). So batch[push "d", kind = single] and the equivalent whole write {kind: "single", tags: [a, b, c, d]} should restore four rows ending in "d" when the list branch returns; today the fourth row returns as null. A push and a switch in separate entries, and an item write to an existing row inside the same batch, restore correctly.',
  schema: listSchema,
  initialValue: { kind: 'list', tags: ['a', 'b', 'c'] },
  steps: [
    { action: 'batch', steps: [{ action: 'push', path: '/tags', value: 'd' }, { action: 'setValue', path: '/kind', value: 'single' }], expect: { shape: { '/tags': 'absent' } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'list' }], expect: { values: { '/tags': ['a', 'b', 'c', 'd'] } } },
  ],
};
