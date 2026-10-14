import type { FormScenario } from '../../types';

/** FRAGMENT-006/048: branch tags are read from an explicit controls.discriminator only. */
const paymentSchema = {
  type: 'object', controls: { discriminator: 'method' }, required: ['method'],
  oneOf: [
    { properties: { method: { const: 'card' }, cardNumber: { type: 'string' } }, required: ['method', 'cardNumber'] },
    { properties: { method: { const: 'bank' }, account: { type: 'string' }, holder: { type: 'string', default: 'owner' } }, required: ['method', 'account'] },
  ],
};

/** A discriminator switch keeps raw values and reports an unmatched tag on the tag node. */
export const discriminatorScenario: FormScenario = {
  name: 'composition.discriminator-tag-switch',
  description: 'FRAGMENT-006 explicit discriminator gates; FRAGMENT-048 hoisted tag node; LANDING-011 no refill; VALIDATE-043 (6) unmatched tag errors on the tag node.',
  schema: paymentSchema,
  initialValue: { method: 'card' },
  steps: [
    { action: 'batch', steps: [], expect: {
      shape: { '/method': 'present', '/cardNumber': 'present', '/account': 'absent', '/holder': 'absent' },
      outputValue: { method: 'card' },
    } },
    { action: 'setValue', path: '/cardNumber', value: '4111', expect: { outputValue: { method: 'card', cardNumber: '4111' } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/method', value: 'bank' }], expect: {
      shape: { '/cardNumber': 'absent', '/account': 'present', '/holder': 'present' },
      outputValue: { method: 'bank', holder: 'owner' },
    } },
    { action: 'setValue', path: '/holder', value: 'Kim', expect: { outputValue: { method: 'bank', holder: 'Kim' } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/method', value: 'card' }], expect: {
      shape: { '/cardNumber': 'present', '/account': 'absent' },
      values: { '/cardNumber': '4111' }, outputValue: { method: 'card', cardNumber: '4111' },
      errors: { '/method': [], '/cardNumber': [] },
    } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/method', value: 'bank' }], expect: {
      shape: { '/account': 'present', '/cardNumber': 'absent' }, values: { '/holder': 'Kim' }, outputValue: { method: 'bank', holder: 'Kim' },
    } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/method', value: 'cash' }], expect: {
      shape: { '/method': 'present', '/cardNumber': 'absent', '/account': 'absent' },
      outputValue: { method: 'cash' },
      errors: { '/method': [{ keyword: 'const' }, { keyword: 'const' }] },
    } },
  ],
};
