import { isArray } from '@winglet/common-utils/filter';

import type { EffectiveSchema } from '../../../blueprint';
import type { StaticChoices } from '../../../types/staticChoices';
import { staticChoices } from '../../../utils/cache/valueMemos';

export type { StaticChoices } from '../../../types/staticChoices';

/** Shared empty order for schemas without a propertyOrder option. */
const NO_KEYS: readonly string[] = Object.freeze([]);
/** Optionless schemas link to this producer-frozen default selection. */
const DEFAULT_CHOICES: StaticChoices = Object.freeze({
  omitEmpty: true,
  omitTrailing: false,
  trim: false,
  propertyOrder: NO_KEYS,
});

/** Read static options once for the lifetime of a merged effective schema. */
export const getStaticChoices = (effective: EffectiveSchema): StaticChoices => {
  const cached = staticChoices.get(effective);
  if (cached) return cached;
  const schema = effective.schema;
  const options =
    typeof schema === 'object' && schema !== null ? schema.options : undefined;
  if (options === undefined) {
    staticChoices.set(effective, DEFAULT_CHOICES);
    return DEFAULT_CHOICES;
  }
  const hints =
    typeof options === 'object' && options !== null && !isArray(options)
      ? options
      : undefined;
  const propertyOrder =
    hints && 'propertyOrder' in hints ? hints.propertyOrder : undefined;
  const choices: StaticChoices = Object.freeze({
    omitEmpty: !hints || !('omitEmpty' in hints) || hints.omitEmpty !== false,
    omitTrailing:
      !!hints && 'omitTrailing' in hints && hints.omitTrailing === true,
    trim: !!hints && 'trim' in hints && hints.trim === true,
    propertyOrder: isArray(propertyOrder)
      ? Object.freeze(
          propertyOrder.filter(
            (key: unknown): key is string => typeof key === 'string',
          ),
        )
      : NO_KEYS,
  });
  staticChoices.set(effective, choices);
  return choices;
};
