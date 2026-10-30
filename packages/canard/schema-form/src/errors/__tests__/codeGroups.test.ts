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
} from '../constants/FormErrorCode';
import { FormErrorGroup } from '../constants/FormErrorGroup';
import {
  FormWarningCode,
  SchemaFormWarningCodes,
} from '../constants/FormWarningCode';
import { FormWarningGroup } from '../constants/FormWarningGroup';
import { JSONSchemaErrorSpecific } from '../constants/JSONSchemaErrorSpecific';
import { SchemaFormErrorSpecific } from '../constants/SchemaFormErrorSpecific';
import { SchemaFormWarningSpecific } from '../constants/SchemaFormWarningSpecific';
import { UnhandledErrorSpecific } from '../constants/UnhandledErrorSpecific';
import { ValidationErrorSpecific } from '../constants/ValidationErrorSpecific';
import { getCodeSpecific } from '../utils/getCodeSpecific';

it('partitions canonical codes by group and matches error class groups', () => {
  expect(new JSONSchemaError(FormErrorCode.UnknownJsonSchema, '').name).toBe(
    FormErrorGroup.JsonSchema,
  );
  const errorGroups = [
    [FormErrorGroup.JsonSchema, JSONSchemaErrorCodes, JSONSchemaErrorSpecific],
    [FormErrorGroup.SchemaForm, SchemaFormErrorCodes, SchemaFormErrorSpecific],
    [FormErrorGroup.Unhandled, UnhandledErrorCodes, UnhandledErrorSpecific],
    [FormErrorGroup.Validation, ValidationErrorCodes, ValidationErrorSpecific],
  ] as const;
  const warningGroups = [
    [
      FormWarningGroup.SchemaForm,
      SchemaFormWarningCodes,
      SchemaFormWarningSpecific,
    ],
  ] as const;

  for (const [canonical, groups] of [
    [FormErrorCode, errorGroups],
    [FormWarningCode, warningGroups],
  ] as const) {
    const derivedValues = groups.flatMap(([group, codes, specifics]) => {
      expect(Object.keys(codes)).toEqual(Object.keys(specifics));
      for (const [key, specific] of Object.entries(specifics)) {
        const value = Object.entries(canonical).find(
          ([name]) => name === key,
        )?.[1];
        expect(value).toBe(`${group}.${specific}`);
      }
      const values = Object.values(codes);
      expect(values.length).toBeGreaterThan(0);
      for (const value of values)
        expect(value.startsWith(`${group}.`)).toBe(true);
      for (const value of values)
        expect(value).toBe(`${group}.${getCodeSpecific(value)}`);
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
  expectTypeOf(SchemaFormErrorCodes.RenderFailed).toEqualTypeOf<
    typeof FormErrorCode.RenderFailed
  >();
  expectTypeOf(UnhandledErrorCodes.RegisterPlugin).toEqualTypeOf<
    typeof FormErrorCode.RegisterPlugin
  >();
  expectTypeOf(ValidationErrorCodes.SchemaValidationFailed).toEqualTypeOf<
    typeof FormErrorCode.SchemaValidationFailed
  >();
  expectTypeOf(SchemaFormWarningCodes.Misfit).toEqualTypeOf<
    typeof FormWarningCode.Misfit
  >();
});

it('preserves every class code, group, specific, message and details with group names', () => {
  const details = { path: '/field' };
  const groups = [
    [
      FormErrorGroup.JsonSchema,
      Object.values(JSONSchemaErrorCodes).map(
        (code) => new JSONSchemaError(code, 'message', details),
      ),
    ],
    [
      FormErrorGroup.SchemaForm,
      Object.values(SchemaFormErrorCodes).map(
        (code) => new SchemaFormError(code, 'message', details),
      ),
    ],
    [
      FormErrorGroup.Unhandled,
      Object.values(UnhandledErrorCodes).map(
        (code) => new UnhandledError(code, 'message', details),
      ),
    ],
    [
      FormErrorGroup.Validation,
      Object.values(ValidationErrorCodes).map(
        (code) => new ValidationError(code, 'message', details),
      ),
    ],
  ] as const;
  for (const [group, errors] of groups)
    for (const error of errors) {
      expect(error.name).toBe(group);
      expect(error.group).toBe(group);
      expect(error.specific).toBe(getCodeSpecific(error.code as FormErrorCode));
      expect(error.code).toBe(`${group}.${error.specific}`);
      expect(Object.values(FormErrorCode)).toContain(error.code);
      expect(error.message).toBe('message');
      expect(error.details).toBe(details);
    }
});
