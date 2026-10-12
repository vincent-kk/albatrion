import type { FormTypeInputMap } from '../../../../src';

import { getLabeledInput } from './getLabeledInput';

/**
 * Build a formTypeInputMap from map keys to labels.
 * @param map - Map keys (pointers, patterns, or wildcard pointers) to labels.
 * @returns The same keys mapped to labelled input components.
 */
export function toInputMap(map: Readonly<Record<string, string>>): FormTypeInputMap {
  return Object.fromEntries(Object.entries(map).map(([key, label]) => [key, getLabeledInput(label)]));
}
