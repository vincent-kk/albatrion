import type { CompositeCase } from './types';

/** Order form: a discriminated payment oneOf beside a shared item array whose rows derive a subtotal. */
const orderSchema = {
  type: 'object', controls: { discriminator: 'payment' }, required: ['payment'],
  properties: {
    items: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, qty: { type: 'integer' }, price: { type: 'number' },
      subtotal: { type: 'number', controls: { derived: '../qty * ../price' } },
    } } },
  },
  oneOf: [
    { properties: { payment: { const: 'card' }, cardNumber: { type: 'string' } }, required: ['payment', 'cardNumber'] },
    { properties: { payment: { const: 'bank' }, account: { type: 'string' }, holder: { type: 'string', default: 'owner' } }, required: ['payment', 'account'] },
  ],
};

/** CX-01: rows and derived subtotals survive a payment switch; submit judges only the active branch. */
export const cx01OrderForm: CompositeCase = {
  scenario: {
    name: 'composite.cx01-order-form',
    description: 'C1 order form (G3, G2, G4, G5). FRAGMENT-006 the discriminator gates card and bank; controls.derived keeps each row subtotal; the array lives outside the union, so a branch switch keeps rows and subtotals; NODE-051 remove(0) shifts the second row into place as the same node; VALIDATE-043 issues of the inactive branch stay off nodes, so submit is rejected only for the bank account, and succeeds once it is filled.',
    schema: orderSchema,
    initialValue: { payment: 'card', items: [] },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/cardNumber': 'present', '/account': 'absent' }, values: { '/items': [] } } },
      { action: 'push', path: '/items', value: { name: 'pen', qty: 2, price: 3 }, expect: { values: { '/items/0/subtotal': 6 } } },
      { action: 'push', path: '/items', value: { name: 'ink', qty: 1, price: 5 }, expect: { values: { '/items/1/subtotal': 5 } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/payment', value: 'bank' }], expect: {
        shape: { '/cardNumber': 'absent', '/account': 'present', '/holder': 'present' },
        values: { '/holder': 'owner', '/items/0/subtotal': 6, '/items/1/subtotal': 5 },
      } },
      { action: 'remove', path: '/items', index: 0, expect: { identity: { '/items/0': '/items/1' }, values: { '/items/0/name': 'ink', '/items/0/subtotal': 5 } } },
      { action: 'batch', steps: [], expect: { errors: { '/account': [{ keyword: 'required' }] } } },
    ],
  },
  tailStart: { payment: 'bank', holder: 'owner', items: [{ name: 'ink', qty: 1, price: 5, subtotal: 5 }] },
  tail: [
    { act: 'submit', rejected: 'SCHEMA_VALIDATION_FAILED' },
    { act: 'write', path: '/account', value: 'KB-1' },
    { act: 'submit', submitted: { payment: 'bank', holder: 'owner', account: 'KB-1', items: [{ name: 'ink', qty: 1, price: 5, subtotal: 5 }] } },
  ],
};
