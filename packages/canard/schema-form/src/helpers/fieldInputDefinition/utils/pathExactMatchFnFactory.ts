import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';
import {
  isAbsolutePointer,
  parsePointerSegments,
  stripFragment,
} from '@/schema-form/helpers/jsonPointer';
import type { FieldInputTestFn } from '@/schema-form/types';

import { formatFieldInputMapError } from './formatFieldInputMapError';

/** Compile an exact or regular-expression path matcher; reject invalid patterns. */
export const pathExactMatchFnFactory = (
  inputPath: string,
): FieldInputTestFn => {
  try {
    const path = stripFragment(inputPath);
    const segments = parsePointerSegments(inputPath);
    const exactEmptyName =
      isAbsolutePointer(inputPath) &&
      segments.length === 1 &&
      segments[0] === '';
    const regex = path && !exactEmptyName ? new RegExp(path) : null;
    return (hint) => {
      if (hint.path === path) return true;
      if (regex?.test(hint.path)) return true;
      return false;
    };
  } catch (error) {
    throw new SchemaFormError(
      FormErrorCode.FormTypeInputMap,
      formatFieldInputMapError(inputPath, error),
      { path: inputPath, error },
    );
  }
};
