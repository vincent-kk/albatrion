import type { FormScenario } from '../../types';

/** A required email with a minimum length, loaded too short. */
const emailSchema = {
  type: 'object',
  required: ['email'],
  properties: { email: { type: 'string', minLength: 3 } },
};

/** An invalid form that the consumer submits through the handle and through Enter. */
export const submitRejectedScenario: FormScenario = {
  name: 'validation-state.submit-rejected',
  description: 'VALIDATE-006 submit validates the snapshot it sends; ERROR-139 a failing handle submit rejects with VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED and onSubmit is not called; ERROR-016 a validation failure is not recorded as a form error. Codes come from submitOutcomes.',
  schema: emailSchema,
  initialValue: { email: 'a' },
  steps: [{ action: 'batch', steps: [], expect: { values: { '/email': 'a' }, errors: { '/email': [{ keyword: 'minLength' }] } } }],
};

/** Submit outcomes the consumer observes beyond the shared steps. */
export const submitOutcomes = {
  rejectionCode: 'VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED',
  validEmail: 'abc',
} as const;
