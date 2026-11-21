import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { submitForm } from '@/schema-form/components/Form/components/FormCore/utils/submitForm';
import { ValidationMode } from '@/schema-form/core/engine/types/state';

import { createValidator } from '../../../../schema-form-ajv8-plugin/src/default/index';

/**
 * FP4. A guard whose custom keyword throws for one user input, followed by input it accepts.
 * The failure should surface once (GuardFailed) and leave nothing that changes later results.
 */
const makeValidator = () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  ajv.addKeyword({
    keyword: 'evenDigits',
    type: 'string',
    validate: (_schema: boolean, data: string) => {
      if (!/^\d+$/.test(data)) throw new TypeError('evenDigits expects digits');
      return data.length % 2 === 0;
    },
  });
  return createValidator(ajv);
};

const jsonSchema = {
  type: 'object',
  properties: { code: { type: 'string' } },
  if: { properties: { code: { evenDigits: true } }, required: ['code'] },
  then: { properties: { extra: { type: 'string' } } },
} as const;

describe('guard keyword that throws for one input, then accepts the next', () => {
  it('[control] input the guard always accepts keeps diagnostics stable', async () => {
    const root = nodeFromJSONSchema({
      jsonSchema: jsonSchema as any,
      defaultValue: { code: '12' } as any,
      validationMode: ValidationMode.OnRequest,
      validator: makeValidator(),
    });
    root.find('/code')!.setValue('1234' as never);
    expect({
      extraActive: root.find('/extra')?.isActive,
      status: root.diagnostics.status,
    }).toEqual({ extraActive: true, status: 'stable' });
  });

  it('after the input is corrected the form returns to the state of the same input without the failure', async () => {
    const records: unknown[] = [];
    const root = nodeFromJSONSchema({
      jsonSchema: jsonSchema as any,
      defaultValue: { code: '12' } as any,
      validationMode: ValidationMode.OnRequest,
      validator: makeValidator(),
      onError: (record: unknown) => records.push(record),
    } as any);
    try {
      root.find('/code')!.setValue('ab' as never);
    } catch {
      // A write that hits a guard failure may throw to its caller; the next write is what matters.
    }
    const afterFailure = root.diagnostics.status;
    root.find('/code')!.setValue('1234' as never);
    let submitted: unknown = 'not submitted';
    const submit = await submitForm(root as any, (value) => {
      submitted = value;
    }).then(
      () => 'resolved',
      (error: { code?: string }) => error.code,
    );
    expect({
      afterFailure,
      extraActive: root.find('/extra')?.isActive,
      status: root.diagnostics.status,
      submit,
      submitted,
    }).toEqual({
      afterFailure: 'degraded',
      extraActive: true,
      status: 'stable',
      submit: 'resolved',
      submitted: { code: '1234' },
    });
  });

  it('[control] the same keyword throwing once in whole validation recovers on the next value', async () => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: { code: { type: 'string', evenDigits: true } } } as any,
      defaultValue: { code: '12' } as any,
      validationMode: ValidationMode.OnRequest,
      validator: makeValidator(),
    });
    root.find('/code')!.setValue('ab' as never);
    const first = await root.validate().then(
      () => 'resolved',
      (error: { code?: string }) => error.code,
    );
    root.find('/code')!.setValue('1234' as never);
    const second = await root.validate();
    expect({ first, second: second.length, status: root.diagnostics.status }).toEqual({
      first: 'SCHEMA_FORM_ERROR.VALIDATOR_THREW',
      second: 0,
      status: 'stable',
    });
  });
});
