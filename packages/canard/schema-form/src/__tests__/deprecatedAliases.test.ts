// Deprecated alias coverage — Removed in 0.16.0 together with the aliases.
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  type InferJSONSchema,
  type InferJsonSchema,
  type JSONSchema,
  type JSONSchemaError,
  type JsonSchema,
  type JsonSchemaError,
  isJSONSchemaError,
  isJsonSchemaError,
} from '../index';

describe('deprecated alias coverage', () => {
  it('isJsonSchemaError is the same reference as isJSONSchemaError', () => {
    expect(isJsonSchemaError).toBe(isJSONSchemaError);
  });

  it('JsonSchemaError and JSONSchemaError are mutually assignable', () => {
    expectTypeOf<JsonSchemaError>().toExtend<JSONSchemaError>();
    expectTypeOf<JSONSchemaError>().toExtend<JsonSchemaError>();
  });

  it('JsonSchema and JSONSchema are mutually assignable', () => {
    expectTypeOf<JsonSchema>().toExtend<JSONSchema>();
    expectTypeOf<JSONSchema>().toExtend<JsonSchema>();
  });

  it('InferJsonSchema and InferJSONSchema are mutually assignable', () => {
    expectTypeOf<InferJsonSchema<string>>().toExtend<InferJSONSchema<string>>();
    expectTypeOf<InferJSONSchema<string>>().toExtend<InferJsonSchema<string>>();
  });
});
