import { createDivider } from './utils/createDivider';
import { formatValuePreview } from './utils/formatValuePreview';
import { getValueType } from './utils/getValueType';

/**
 * Formats a structured error message for invalid virtual node values.
 * @param expectedLength - Expected number of elements in the values array
 * @param actualLength - Actual length of provided values (if array)
 * @param providedValues - The actual values that were provided
 */
export const formatInvalidVirtualNodeValuesError = (
  expectedLength: number,
  actualLength: number | undefined,
  providedValues: unknown,
): string => {
  const divider = createDivider();
  const lengthMismatch =
    actualLength !== undefined
      ? `Expected ${expectedLength}, got ${actualLength}`
      : `Expected ${expectedLength}-element array`;

  return `
Invalid values for virtual node.

  ╭${divider}
  │  Expected:   ${expectedLength}-element array
  │  Received:   ${getValueType(providedValues)}
  │  Mismatch:   ${lengthMismatch}
  ├${divider}
  │  Value Preview:  ${formatValuePreview(providedValues, 50)}
  ╰${divider}

Virtual nodes expect an array with a specific number of elements
matching the number of reference fields defined in 'virtual.fields'.

How to fix:
  1. Provide an array with exactly ${expectedLength} element(s):
     virtualNode.setValue([value1${expectedLength > 1 ? ', value2' : ''}${expectedLength > 2 ? ', ...' : ''}])

  2. Use 'undefined' to reset all reference values:
     virtualNode.setValue(undefined)

  3. Check that virtual.fields configuration matches your data structure
`.trim();
};
