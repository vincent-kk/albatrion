import type { FormScenario } from '../../types';
import { companySchema } from './if-then-else.scenario';

/** A guarded then branch plus an unrelated field written only inside a batch. */
const noteSchema = {
  type: 'object', properties: { company: { type: 'boolean' }, note: { type: 'string' } },
  if: { properties: { company: { const: true } }, required: ['company'] },
  then: { properties: { vat: { type: 'string' } } },
};

/** Multi-write batches keep retained inactive raw values: replacement is bounded to the paths the batch wrote. */
export const batchRetentionScenarios: readonly FormScenario[] = [
  {
    name: 'composition.batch-keeps-inactive-raw',
    description: 'LANDING-018 and LANDING-032 keep inactive raw values and 26C-10 clears them only under a replaced path, so a two-write batch on an unrelated field keeps the hidden /vat value and reopening the branch restores it.',
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
    name: 'composition.batched-toggle-keeps-edit',
    description: 'EVENT-013 a batch settles once and LANDING-011 does not refill an existing node, so a batched triple toggle that reopens a hidden then branch restores its edited value instead of the default.',
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
