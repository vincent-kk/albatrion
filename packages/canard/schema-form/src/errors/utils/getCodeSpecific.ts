import type { FormErrorCode } from '../constants/FormErrorCode';
import { FormErrorGroup } from '../constants/FormErrorGroup';
import type { FormWarningCode } from '../constants/FormWarningCode';
import { FormWarningGroup } from '../constants/FormWarningGroup';
import { JSONSchemaErrorSpecific } from '../constants/JSONSchemaErrorSpecific';
import { SchemaFormErrorSpecific } from '../constants/SchemaFormErrorSpecific';
import { SchemaFormWarningSpecific } from '../constants/SchemaFormWarningSpecific';
import { UnhandledErrorSpecific } from '../constants/UnhandledErrorSpecific';
import { ValidationErrorSpecific } from '../constants/ValidationErrorSpecific';

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
