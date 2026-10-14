import type { CompositeCase } from './types';

/** One bounded name, judged by a validator the consumer can hold. */
const heldSchema = { type: 'object', properties: { name: { type: 'string', minLength: 3 } } };

/** CX-09: a verdict that arrives after reset does not attach to the reloaded form. */
export const cx09ResetDuringValidation: CompositeCase = {
  scenario: {
    name: 'composite.cx09-reset-during-validation',
    description: 'EVENT-046 a validation result is delivered only when its commit stamp is still the latest, and a late result is dropped; WRITE-044 reset reloads and clears verdicts. The shared steps validate normally; the tail holds the validator, writes an invalid value, resets before the verdict, releases it, and checks that no issue attaches, then that the next invalid write is judged again.',
    schema: heldSchema,
    initialValue: { name: 'okay' },
    steps: [
      { action: 'batch', steps: [{ action: 'setValue', path: '/name', value: 'x' }], expect: { errors: { '/name': [{ keyword: 'minLength' }] } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/name', value: 'okay' }], expect: { errors: { '/name': [] } } },
    ],
  },
  tailStart: { name: 'okay' },
  tail: [
    { act: 'holdValidation' },
    { act: 'write', path: '/name', value: 'x' },
    { act: 'reset' },
    { act: 'releaseValidation' },
    { act: 'errors', errors: { '/name': [] } },
    { act: 'write', path: '/name', value: 'y' },
    { act: 'errors', errors: { '/name': ['minLength'] } },
  ],
};
