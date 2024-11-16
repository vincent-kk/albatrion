import { beforeEach, describe, expect, it } from 'vitest';

import type { JsonSchemaError } from '@lumy/schema-form/types';

import { transformErrors } from './transformErrors';

describe('transformErrors', () => {
  let errors: JsonSchemaError[];

  beforeEach(() => {
    errors = [
      {
        keyword: 'required',
        instancePath: '',
        schemaPath: '#/required',
        params: { missingProperty: 'name' },
        message: "should have required property 'name'",
      },
      {
        keyword: 'type',
        instancePath: '/age',
        schemaPath: '#/properties/age/type',
        params: { type: 'number' },
        message: 'should be number',
      },
    ];
  });

  it('should transform errors with missing property', () => {
    const result = transformErrors(errors);
    expect(result).toEqual([
      {
        ...errors[0],
        key: undefined,
        instancePath: 'name',
      },
      {
        ...errors[1],
        key: undefined,
      },
    ]);
  });

  it('should add keys when useKey is true', () => {
    const result = transformErrors(errors, true);
    expect(result).toEqual([
      {
        ...errors[0],
        key: 1,
        instancePath: 'name',
      },
      {
        ...errors[1],
        key: 2,
      },
    ]);
  });

  it('should handle empty errors array', () => {
    const result = transformErrors([]);
    expect(result).toEqual([]);
  });

  it('should handle non-array input', () => {
    const result = transformErrors(null as unknown as JsonSchemaError[]);
    expect(result).toEqual([]);
  });
});
