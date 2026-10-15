import { expect, expectTypeOf, it } from 'vitest';

import { JSONSchemaError } from '../classes/JSONSchemaError';
import { SchemaFormError } from '../classes/SchemaFormError';
import { UnhandledError } from '../classes/UnhandledError';
import { ValidationError } from '../classes/ValidationError';
import {
  FormErrorCode,
  JSONSchemaErrorCodes,
  SchemaFormErrorCodes,
  UnhandledErrorCodes,
  ValidationErrorCodes,
} from '../codes/FormErrorCode';
import { FormErrorGroup } from '../codes/FormErrorGroup';
import {
  FormWarningCode,
  SchemaFormWarningCodes,
} from '../codes/FormWarningCode';
import { FormWarningGroup } from '../codes/FormWarningGroup';

it('partitions canonical codes by group and matches error class groups', () => {
  const errorGroups = [
    [FormErrorGroup.JsonSchema, JSONSchemaErrorCodes],
    [FormErrorGroup.SchemaForm, SchemaFormErrorCodes],
    [FormErrorGroup.Unhandled, UnhandledErrorCodes],
    [FormErrorGroup.Validation, ValidationErrorCodes],
  ] as const;
  const warningGroups = [
    [FormWarningGroup.SchemaForm, SchemaFormWarningCodes],
  ] as const;

  for (const [canonical, groups] of [
    [FormErrorCode, errorGroups],
    [FormWarningCode, warningGroups],
  ] as const) {
    const derivedValues = groups.flatMap(([group, codes]) => {
      const values = Object.values(codes);
      expect(values.length).toBeGreaterThan(0);
      for (const value of values)
        expect(value.startsWith(`${group}.`)).toBe(true);
      return values;
    });
    expect(derivedValues).toHaveLength(Object.values(canonical).length);
    expect([...derivedValues].sort()).toEqual(Object.values(canonical).sort());
  }

  expect(new JSONSchemaError(FormErrorCode.UnknownJsonSchema, '').group).toBe(
    FormErrorGroup.JsonSchema,
  );
  expect(new SchemaFormError(FormErrorCode.RenderFailed, '').group).toBe(
    FormErrorGroup.SchemaForm,
  );
  expect(new UnhandledError(FormErrorCode.RegisterPlugin, '').group).toBe(
    FormErrorGroup.Unhandled,
  );
  expect(
    new ValidationError(FormErrorCode.SchemaValidationFailed, '').group,
  ).toBe(FormErrorGroup.Validation);

  expectTypeOf(
    FormErrorCode.UnknownJsonSchema,
  ).toEqualTypeOf<'JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA'>();
  expectTypeOf(
    FormWarningCode.Misfit,
  ).toEqualTypeOf<'SCHEMA_FORM_WARNING.MISFIT'>();
  expectTypeOf(JSONSchemaErrorCodes.UnknownJsonSchema).toEqualTypeOf<
    typeof FormErrorCode.UnknownJsonSchema
  >();
});
