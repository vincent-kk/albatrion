import type { CompositeCase } from './types';
import { reentryGuard, reentryOptions, reentryProperties, reentrySteps, reentryTail, reentryValue } from './reentry';

/** Tier oneOf → plan mode oneOf → anyOf add-ons, plus the 197C-01 fields. */
const nestedSchema = {
  type: 'object', controls: { discriminator: 'tier' }, required: ['tier'],
  properties: reentryProperties,
  options: reentryOptions,
  oneOf: [
    { properties: { tier: { const: 'basic' }, seats: { type: 'integer' } } },
    { properties: { tier: { const: 'pro' }, plan: {
      type: 'object', controls: { discriminator: 'mode' }, required: ['mode'],
      properties: { sso: { type: 'boolean' }, audit: { type: 'boolean' } },
      oneOf: [
        { properties: { mode: { const: 'monthly' }, price: { type: 'number' } } },
        { properties: { mode: { const: 'yearly' }, discount: { type: 'number' } } },
      ],
      anyOf: [
        { if: { properties: { sso: { const: true } }, required: ['sso'] }, then: { properties: { ssoDomain: { type: 'string' } } } },
        { if: { properties: { audit: { const: true } }, required: ['audit'] }, then: { properties: { auditDays: { type: 'integer' } } } },
      ],
    } } },
  ],
  ...reentryGuard,
};

/** CX-13: each layer toggles forward and backward and keeps its raw values, then the 197C-01 steps. */
export const cx13NestedOneofAnyof: CompositeCase = {
  scenario: {
    name: 'composite.cx13-nested-oneof-anyof',
    description: 'Three nested layers: the inner mode switch keeps discount, the add-on guard keeps ssoDomain, and the outer tier switch drops the whole plan subtree and restores it with every inner raw value (FRAGMENT-021, LANDING-018). Toggles run inner to outer and back outer to inner. Then 197C-01: R2 a virtual batch write, and in the tail R1, other-kind re-entry inside a batch after a Merge write.',
    schema: nestedSchema,
    initialValue: { tier: 'pro', plan: { mode: 'yearly', discount: 10, sso: true, ssoDomain: 'a.com' }, ...reentryValue },
    steps: [
      { action: 'batch', steps: [], expect: { shape: { '/plan/discount': 'present', '/plan/ssoDomain': 'present', '/plan/auditDays': 'absent', '/seats': 'absent' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/plan/mode', value: 'monthly' }], expect: { shape: { '/plan/discount': 'absent', '/plan/price': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/plan/sso', value: false }], expect: { shape: { '/plan/ssoDomain': 'absent' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/tier', value: 'basic' }], expect: { shape: { '/plan': 'absent', '/seats': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/tier', value: 'pro' }], expect: {
        shape: { '/plan/price': 'present', '/plan/ssoDomain': 'absent' }, values: { '/plan/mode': 'monthly', '/plan/sso': false },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/plan/sso', value: true }], expect: { values: { '/plan/ssoDomain': 'a.com' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/plan/mode', value: 'yearly' }], expect: { values: { '/plan/discount': 10, '/plan/ssoDomain': 'a.com' } } },
      { action: 'batch', steps: [
        { action: 'setValue', path: '/tier', value: 'basic' }, { action: 'setValue', path: '/tier', value: 'pro' },
      ], expect: { values: { '/plan/mode': 'yearly', '/plan/discount': 10, '/plan/ssoDomain': 'a.com' } } },
      ...reentrySteps,
    ],
  },
  tailStart: { tier: 'pro', plan: { mode: 'yearly', discount: 10, sso: true, ssoDomain: 'a.com' }, mode: 'text', value: 's', startDate: 's1', endDate: 'e1', note: 'y' },
  tail: reentryTail,
};
