import { expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { ValidationMode } from '@/schema-form/core';
import { FormErrorCode } from '@/schema-form/errors';

import { submitForm } from '../submitForm';

it('G characterization delivers an if-schema compile rejection to submit onFailure', async () => {
  const cause = new Error('submit whole compile');
  const root = nodeFromJSONSchema({
    jsonSchema: { type: 'object', if: {}, then: { type: 'object' } },
    validator: {
      compile: () => {
        throw cause;
      },
      compileGuard: () => () => true,
    },
    validationMode: ValidationMode.OnRequest,
    deferMountValidation: true,
    errorReporter: { report: vi.fn(), hasConsumer: () => true },
  });
  const onFailure = vi.fn();
  const onSubmit = vi.fn();
  const rejection = await submitForm(root, onSubmit, onFailure).catch(
    (error: unknown) => error,
  );
  expect(rejection).toMatchObject({
    code: FormErrorCode.ValidatorCompileFailed,
    details: { error: cause },
  });
  expect(onFailure).toHaveBeenCalledExactlyOnceWith(rejection);
  expect(onSubmit).not.toHaveBeenCalled();
});
