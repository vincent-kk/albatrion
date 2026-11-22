import { act } from 'react';

import {
  ErrorVisibility,
  Form,
  type FormHandle,
  type JSONSchema,
  ValidationMode,
} from '@canard/schema-form';
import Ajv from 'ajv';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';

import { createValidator } from '../../index';

/**
 * Round 5, hunter r5-ajv-ownership: form-level path of compiledApplicationSchema.test.ts.
 * The core calls `release(copy)` when a released root is replaced by another root with the
 * same `$id` (VALIDATE-045), for example a schema object rebuilt between two visits of a route.
 */
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ID = 'https://r5.invalid/ajv6/compiled-by-application-form';
const buildSchema = () =>
  ({
    $id: ID,
    type: 'object',
    properties: { name: { type: 'string', minLength: 3 } },
  }) satisfies JSONSchema;

const ajv = new Ajv({ allErrors: true });
const validatorFactory = createValidator(ajv);

const visit = async (jsonSchema: JSONSchema) => {
  const container = document.body.appendChild(document.createElement('div'));
  const reactRoot = createRoot(container);
  let handle: FormHandle | null = null;
  await act(async () => {
    reactRoot.render(
      <Form
        ref={(form) => void (handle = form)}
        jsonSchema={jsonSchema}
        defaultValue={{ name: 'ab' }}
        validationMode={ValidationMode.OnRequest}
        errorVisibility={ErrorVisibility.Always}
        validatorFactory={validatorFactory}
      />,
    );
  });
  const form = handle as unknown as FormHandle;
  let outcome: unknown;
  await act(async () => {
    try {
      await form.validate();
      outcome = form.findNode('/name')?.errors.map((issue) => issue.keyword);
    } catch (error) {
      outcome = `validate rejected: ${(error as Error).message}`;
    }
  });
  await act(async () => reactRoot.unmount());
  container.remove();
  return outcome;
};

const applicationVerdict = (schema: JSONSchema, data: unknown) => {
  try {
    return ajv.validate(schema, data);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

describe('ajv6: the application validates a schema object that a route Form also uses', () => {
  it('two visits with a rebuilt schema object keep both the application and the form validating', async () => {
    const schema = buildSchema();
    expect(applicationVerdict(schema, { name: 'ab' })).toBe(false);
    expect(await visit(schema)).toEqual(['minLength']);
    // Second visit: the route rebuilds its schema object; the core evicts the first root (same $id).
    expect(await visit(buildSchema())).toEqual(['minLength']);
    expect(applicationVerdict(schema, { name: 'abc' })).toBe(true);
  });
});
