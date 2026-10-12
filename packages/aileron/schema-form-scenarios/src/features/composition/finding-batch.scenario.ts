import type { FormScenario } from '../../types';
import { companySchema } from './if-then-else.scenario';

/** A guarded then branch plus an unrelated field written only inside a batch. */
const noteSchema = {
  type: 'object', properties: { company: { type: 'boolean' }, note: { type: 'string' } },
  if: { properties: { company: { const: true } }, required: ['company'] },
  then: { properties: { vat: { type: 'string' } } },
};

/**
 * Finding (07c G3): a batch with two or more writes settles as a caller replacement of the root and prunes every
 * retained inactive raw value. The expectations state the ledger contract, so these scenarios fail until fixed.
 */
export const batchFindingScenarios: readonly FormScenario[] = [
  {
    name: 'composition.finding-batch-prunes-inactive-raw',
    description: 'Finding: LANDING-018 and LANDING-032 keep inactive raw values and 26C-10 clears them only under a replaced path, but a two-write batch on an unrelated field drops the hidden /vat value.',
    schema: noteSchema,
    initialValue: { company: true, vat: 'VAT-9' },
    steps: [
      { action: 'setValue', path: '/company', value: false, expect: { shape: { '/vat': 'absent' }, outputValue: { company: false } } },
      { action: 'batch', steps: [
        { action: 'setValue', path: '/note', value: 'x' },
        { action: 'setValue', path: '/note', value: 'y' },
      ], expect: { outputValue: { company: false, note: 'y' } } },
      { action: 'setValue', path: '/company', value: true, expect: {
        shape: { '/vat': 'present' }, values: { '/vat': 'VAT-9' }, outputValue: { company: true, note: 'y', vat: 'VAT-9' },
      } },
    ],
  },
  {
    name: 'composition.finding-batched-toggle-refills-default',
    description: 'Finding: EVENT-013 a batch settles once, and LANDING-011 does not refill an existing node, but a batched triple toggle that reopens a hidden then branch replaces its edited value with the default.',
    schema: companySchema,
    initialValue: { company: true, vat: 'VAT-9' },
    steps: [
      { action: 'setValue', path: '/company', value: false, expect: { shape: { '/vat': 'absent' }, outputValue: { company: false } } },
      { action: 'batch', steps: [
        { action: 'setValue', path: '/company', value: true },
        { action: 'setValue', path: '/company', value: false },
        { action: 'setValue', path: '/company', value: true },
      ], expect: { shape: { '/vat': 'present' }, values: { '/vat': 'VAT-9' }, outputValue: { company: true, vat: 'VAT-9' } } },
    ],
  },
];
