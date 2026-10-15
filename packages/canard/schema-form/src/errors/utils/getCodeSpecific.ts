import type { FormErrorCode } from './FormErrorCode';
import { FormErrorGroup } from './FormErrorGroup';
import type { FormWarningCode } from './FormWarningCode';
import { FormWarningGroup } from './FormWarningGroup';
import { JSONSchemaErrorSpecific } from './JSONSchemaErrorSpecific';
import { SchemaFormErrorSpecific } from './SchemaFormErrorSpecific';
import { SchemaFormWarningSpecific } from './SchemaFormWarningSpecific';
import { UnhandledErrorSpecific } from './UnhandledErrorSpecific';
import { ValidationErrorSpecific } from './ValidationErrorSpecific';

/** Code-to-specific index assembled once from the bare specific tables. */
const SPECIFICS = new Map<string, string>(
  (
    [
      [FormErrorGroup.JsonSchema, JSONSchemaErrorSpecific],
      [FormErrorGroup.SchemaForm, SchemaFormErrorSpecific],
      [FormErrorGroup.Unhandled, UnhandledErrorSpecific],
      [FormErrorGroup.Validation, ValidationErrorSpecific],
      [FormWarningGroup.SchemaForm, SchemaFormWarningSpecific],
    ] as const
  ).flatMap(([group, specifics]) =>
    Object.values(specifics).map((specific): [string, string] => [
      `${group}.${specific}`,
      specific,
    ]),
  ),
);

/**
 * Resolve a canonical code through the specific index.
 * @param code - A supported error or warning code.
 * @returns The bare specific supplied to BaseError.
 */
export const getCodeSpecific = (
  code: FormErrorCode | FormWarningCode,
): string => {
  const specific = SPECIFICS.get(code);
  if (specific === undefined) throw new Error(`Unknown form code: ${code}`);
  return specific;
};
