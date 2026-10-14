import type { CompositeCase } from './types';

/** An email with a length bound, judged by both the server and the validator. */
const emailSchema = { type: 'object', properties: { email: { type: 'string', minLength: 5 } } };

/** CX-15: external errors and validator issues share a node, in a fixed order, and leave independently. */
export const cx15ExternalAndValidationErrors: CompositeCase = {
  scenario: {
    name: 'composite.cx15-external-and-validation-errors',
    description: 'VALIDATE-043 a node lists external errors before validator issues; fixing the value drops only the validator issue; an empty errors prop drops the external one; a non-array errors prop is read as an empty list (178C-01); getErrors() is the root external errors followed by the validation list (79C-01). The shared steps check the validator side; the tail stages the errors prop.',
    schema: emailSchema,
    initialValue: { email: 'a@b' },
    steps: [
      { action: 'batch', steps: [], expect: { errors: { '/email': [{ keyword: 'minLength' }] } } },
    ],
  },
  props: { errors: [{ dataPath: '/email', keyword: 'server', message: 'email is taken' }] },
  tailStart: { email: 'a@b' },
  tail: [
    { act: 'errors', errors: { '/email': ['server', 'minLength'] } },
    { act: 'write', path: '/email', value: 'a@b.co' },
    { act: 'errors', errors: { '/email': ['server'] } },
    { act: 'props', stage: { errors: [] } },
    { act: 'errors', errors: { '/email': [] } },
    { act: 'props', stage: { errors: { email: 'not a list' } } },
    { act: 'errors', errors: { '/email': [] } },
    { act: 'write', path: '/email', value: 'x' },
    { act: 'globalErrors', keywords: ['minLength'] },
  ],
};
