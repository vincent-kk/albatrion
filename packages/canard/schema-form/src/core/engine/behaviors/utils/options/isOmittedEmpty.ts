import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isEmptyArray, isEmptyPlainObject } from '@winglet/common-utils/filter';

import { mergeEffectiveSchema } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import { getStaticChoices } from './getStaticChoices';

/** Empty active-declaration list: only ungated contributions apply. */
const NO_ACTIVE_DECLARATION_IDS: readonly number[] = EMPTY_ARRAY;

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
  return value === '' || isEmptyArray(value) || isEmptyPlainObject(value);
};
