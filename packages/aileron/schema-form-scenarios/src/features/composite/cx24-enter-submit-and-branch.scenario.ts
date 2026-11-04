import type { CompositeCase } from './types';

/** Branch a requires a reference; branch b requires nothing. */
const submitSchema = {
  type: 'object', controls: { discriminator: 'kind' }, required: ['kind'],
  oneOf: [
    { properties: { kind: { const: 'a' }, ref: { type: 'string' } }, required: ['kind', 'ref'] },
    { properties: { kind: { const: 'b' }, note: { type: 'string' } } },
  ],
};

/** CX-24: submit is rejected while the active branch is invalid, and passes after a switch or a fix. */
export const cx24EnterSubmitAndBranch: CompositeCase = {
  scenario: {
    name: 'composite.cx24-enter-submit-and-branch',
    description: 'Submit judges only the active branch (VALIDATE-043): with branch a missing its required ref, submit is rejected; switching to b submits; switching back to a and filling ref submits. The story presses Enter in a field for each submit; a native submit rejection reaches only the sink (ERROR-139). The shared steps show the issue moving with the branch.',
    schema: submitSchema,
    initialValue: { kind: 'a' },
    steps: [
      { action: 'batch', steps: [], expect: { errors: { '/ref': [{ keyword: 'required' }] } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'b' }], expect: { shape: { '/ref': 'absent', '/note': 'present' } } },
      { action: 'batch', steps: [{ action: 'setValue', path: '/kind', value: 'a' }], expect: { errors: { '/ref': [{ keyword: 'required' }] } } },
    ],
  },
  tailStart: { kind: 'a' },
  tail: [
    { act: 'submit', rejected: 'SCHEMA_VALIDATION_FAILED' },
    { act: 'write', path: '/kind', value: 'b' },
    { act: 'submit', submitted: { kind: 'b' } },
    { act: 'write', path: '/kind', value: 'a' },
    { act: 'write', path: '/ref', value: 'R-1' },
    { act: 'submit', submitted: { kind: 'a', ref: 'R-1' } },
  ],
};
