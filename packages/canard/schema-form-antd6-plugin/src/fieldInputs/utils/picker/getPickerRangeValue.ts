import type { Dayjs } from 'dayjs';

import { isArray } from '@winglet/common-utils/filter';

import { parsePickerValue } from './parsePickerValue';

/**
 * Converts a stored pair to the picker's initial endpoints.
 * @param value - Stored endpoints, which may be absent or have the wrong shape.
 * @param format - Stored spelling of each endpoint.
 * @returns The pair of picker values, or undefined for a missing pair.
 */
export const getPickerRangeValue = (
  value: readonly (string | null)[] | null | undefined,
  format: string,
): [Dayjs, Dayjs] | undefined =>
  isArray(value) && value.length === 2
    ? [parsePickerValue(value[0], format), parsePickerValue(value[1], format)]
    : undefined;
