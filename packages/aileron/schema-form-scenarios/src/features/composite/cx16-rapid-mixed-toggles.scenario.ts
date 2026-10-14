import type { CompositeCase } from './types';
import { reentryGuard, reentryOptions, reentryProperties, reentrySteps, reentryTail, reentryValue } from './reentry';

/** An active-gated extra field and a company guard in one form, plus the 197C-01 fields. */
const mixedSchema = {
  type: 'object',
  properties: {
    ...reentryProperties,
    gate: { type: 'boolean' },
    extra: { type: 'string', controls: { active: '../gate === true' } },
    company: { type: 'boolean' },
  },
  options: reentryOptions,
  allOf: [
    { if: { properties: { company: { const: true } }, required: ['company'] }, then: { properties: { vat: { type: 'string' } } }, else: { properties: { pid: { type: 'string' } } } },
    reentryGuard,
  ],
};

/** CX-16: two kinds of gates flip in screen writes and in batches, and both sides keep raw values throughout. */
export const cx16RapidMixedToggles: CompositeCase = {
  scenario: {
    name: 'composite.cx16-rapid-mixed-toggles',
    description: 'controls.active removes a node and its value from the output (CONTROLS-021) while if/then/else keeps the inactive raw value (LANDING-018): three single toggles with writes between them, four toggles inside one batch, and both gates flipped in the same batch each end with both sides restorable. Then 197C-01: R2 a virtual batch write, and in the tail R1, other-kind re-entry inside a batch after a Merge write.',
    schema: mixedSchema,
    initialValue: { gate: true, extra: 'e', company: true, vat: 'V', ...reentryValue },
    steps: [
      { action: 'setValue', path: '/company', value: false, expect: { shape: { '/vat': 'absent', '/pid': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/pid', value: 'P' }], expect: { values: { '/pid': 'P' } } },
      { action: 'setValue', path: '/company', value: true, expect: { values: { '/vat': 'V' } } },
      { action: 'setValue', path: '/gate', value: false, expect: { shape: { '/extra': 'absent' } } },
      { action: 'setValue', path: '/gate', value: true, expect: { shape: { '/extra': 'present' } } },
      { action: 'batch', steps: [
        { action: 'setValue', path: '/company', value: false }, { action: 'setValue', path: '/company', value: true },
        { action: 'setValue', path: '/company', value: false }, { action: 'setValue', path: '/company', value: true },
      ], expect: { values: { '/vat': 'V' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/company', value: false }, { action: 'setValue', path: '/gate', value: false }], expect: {
        shape: { '/extra': 'absent', '/vat': 'absent', '/pid': 'present' }, values: { '/pid': 'P' },
      } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/company', value: true }, { action: 'setValue', path: '/gate', value: true }], expect: {
        shape: { '/extra': 'present', '/vat': 'present' }, values: { '/vat': 'V' },
      } },
      ...reentrySteps,
    ],
  },
  tailStart: { gate: true, company: true, vat: 'V', mode: 'text', value: 's', startDate: 's1', endDate: 'e1', note: 'y' },
  tail: reentryTail,
};
