import { describe, expect, it } from 'vitest';

import { JSONSchemaError } from '../classes/JSONSchemaError';
import { SchemaFormError } from '../classes/SchemaFormError';
import { UnhandledError } from '../classes/UnhandledError';
import { ValidationError } from '../classes/ValidationError';
import { FormErrorCode } from '../codes/FormErrorCode';

describe('error class codes', () => {
  it.each([
    [
      () => new SchemaFormError(FormErrorCode.RenderFailed, 'message'),
      'SCHEMA_FORM_ERROR',
      'RENDER_FAILED',
    ],
    [
      () => new JSONSchemaError(FormErrorCode.UnknownJsonSchema, 'message'),
      'JSON_SCHEMA_ERROR',
      'UNKNOWN_JSON_SCHEMA',
    ],
    [
      () => new UnhandledError(FormErrorCode.RegisterPlugin, 'message'),
      'UNHANDLED_ERROR',
      'REGISTER_PLUGIN',
    ],
    [
      () =>
        new ValidationError(FormErrorCode.SchemaValidationFailed, 'message'),
      'VALIDATION_ERROR',
      'SCHEMA_VALIDATION_FAILED',
    ],
  ] as const)(
    'keeps one group prefix in code for %#',
    (create, group, specific) => {
      const error = create();
      expect(error.code).toBe(`${group}.${specific}`);
      expect(error.group).toBe(group);
      expect(error.specific).toBe(specific);
    },
  );
});
