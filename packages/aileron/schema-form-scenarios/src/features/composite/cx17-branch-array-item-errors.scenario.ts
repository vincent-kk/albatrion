import type { CompositeCase } from './types';

/** A card branch with a card list whose numbers follow a pattern, and a bank branch. */
const cardsSchema = {
  type: 'object', controls: { discriminator: 'method' }, required: ['method'],
  oneOf: [
    { properties: { method: { const: 'card' }, cards: { type: 'array', items: { type: 'string', pattern: '^[0-9]{4}$' } } } },
    { properties: { method: { const: 'bank' }, account: { type: 'string' } } },
  ],
};

/** CX-17: item errors in a branch array leave with the branch, return with it, and follow a moved item. */
export const cx17BranchArrayItemErrors: CompositeCase = {
  scenario: {
    name: 'composite.cx17-branch-array-item-errors',
    description: 'Pattern issues land on each card item path; switching to bank drops the card list from the emitted value, so the validator no longer sees it and the form-level list is empty once bank validates (LANDING-018, VALIDATE-043); switching back attaches them again; removing the middle card moves the last card and its issue to the middle index (NODE-051).',
    schema: cardsSchema,
    initialValue: { method: 'card', cards: ['12x4', '1234', 'abcd'] },
    steps: [
      { action: 'batch', steps: [], expect: { errors: { '/cards/0': [{ keyword: 'pattern' }], '/cards/1': [], '/cards/2': [{ keyword: 'pattern' }] } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/method', value: 'bank' }], expect: { shape: { '/cards': 'absent' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/method', value: 'card' }], expect: {
        values: { '/cards': ['12x4', '1234', 'abcd'] }, errors: { '/cards/0': [{ keyword: 'pattern' }], '/cards/2': [{ keyword: 'pattern' }] },
      } },
      { action: 'remove', path: '/cards', index: 1, expect: {
        identity: { '/cards/1': '/cards/2' }, values: { '/cards': ['12x4', 'abcd'] },
        errors: { '/cards/0': [{ keyword: 'pattern' }], '/cards/1': [{ keyword: 'pattern' }] },
      } },
    ],
  },
  tailStart: { method: 'bank', cards: ['12x4', '1234', 'abcd'] },
  tail: [
    { act: 'write', path: '/account', value: 'KB-1' },
    { act: 'globalErrors', keywords: [] },
  ],
};
