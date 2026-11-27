import type { FieldInputProps } from '@canard/schema-form';

import { antdMinorVersion } from '../antdMinorVersion';

/**
 * Supplies the addresses supported by the installed range picker.
 * @param inputId - Address of the primary control.
 * @param getInputId - Core address resolver for the second control.
 * @returns The single legacy ID or the start and end IDs.
 */
export const getRangePickerId = (
  inputId: string,
  getInputId: FieldInputProps['getInputId'],
) =>
  antdMinorVersion < 14 ? inputId : { start: inputId, end: getInputId('end') };
