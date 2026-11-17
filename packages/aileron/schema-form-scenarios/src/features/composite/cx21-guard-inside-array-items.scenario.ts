import type { CompositeCase } from './types';

/** Line items whose approval is required above a price, judged by a validator guard per item. */
const linesSchema = {
  type: 'object',
  properties: {
    lines: { type: 'array', items: {
      type: 'object', properties: { price: { type: 'number' } },
      if: { properties: { price: { exclusiveMinimum: 100 } }, required: ['price'] },
      then: { properties: { approval: { type: 'string' } }, required: ['approval'] },
    } },
  },
};

/** CX-21: a per-item guard reveals approval and its required issue, which follow items through verbs. */
export const cx21GuardInsideArrayItems: CompositeCase = {
  scenario: {
    name: 'composite.cx21-guard-inside-array-items',
    description: 'FRAGMENT-009 each item guard reads its own price: a pushed expensive item reveals approval with a required issue; update makes a cheap item expensive; removing the first item moves the remaining items and their issues down by one index (NODE-051).',
    schema: linesSchema,
    initialValue: { lines: [{ price: 10 }] },
    steps: [
      { action: 'push', path: '/lines', value: { price: 500 }, expect: { shape: { '/lines/1/approval': 'present', '/lines/0/approval': 'absent' }, errors: { '/lines/1/approval': [{ keyword: 'required' }] } } },
      { action: 'update', path: '/lines', index: 0, value: { price: 200 }, expect: { shape: { '/lines/0/approval': 'present' }, errors: { '/lines/0/approval': [{ keyword: 'required' }] } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/lines/1/approval', value: 'ok' }], expect: { errors: { '/lines/1/approval': [] } } },
      { action: 'remove', path: '/lines', index: 0, expect: { identity: { '/lines/0': '/lines/1' }, values: { '/lines/0/approval': 'ok' }, errors: { '/lines/0/approval': [] } } },
    ],
  },
};
