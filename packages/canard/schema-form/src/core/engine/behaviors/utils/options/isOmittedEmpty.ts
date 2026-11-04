import { isArray } from '@winglet/common-utils/filter';

import { mergeEffectiveSchema } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import { getStaticChoices } from './getStaticChoices';

/** Empty active-declaration list: only ungated contributions apply. */
const NO_ACTIVE_DECLARATION_IDS: readonly number[] = Object.freeze([]);

/** Merge options selecting the runtime effective schema. */
const RUNTIME_MERGE_OPTIONS = { mode: 'runtime' } as const;

/**
 * Decide whether a latent leaf can emit under static omitEmpty (26C-14).
 * @param template - Declaration whose ungated static choices govern the value
 * @param value - Interpreted value proposed for a latent leaf
 * @returns Whether this value would have no projected emit in shape
 */
export const isOmittedEmpty = (
  template: BlueprintNode,
  value: unknown,
): boolean => {
  if (
    !getStaticChoices(
      mergeEffectiveSchema(
        template,
        NO_ACTIVE_DECLARATION_IDS,
        RUNTIME_MERGE_OPTIONS,
      ),
    ).omitEmpty
  )
    return false;
  if (value === '') return true;
  if (isArray(value)) return value.length === 0;
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return (
    (prototype === Object.prototype || prototype === null) &&
    Object.keys(value).length === 0
  );
};
