import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { isPlainObject } from '@winglet/common-utils/filter';

import type { EffectiveSchema } from '../../../blueprint';
import type { StaticChoices } from '../../../types/staticChoices';
import { staticChoices } from '../../../utils/cache/valueMemos';

export type { StaticChoices } from '../../../types/staticChoices';

/** Optionless schemas link to this producer-frozen default selection. */
const DEFAULT_CHOICES: StaticChoices = Object.freeze({
  omitEmpty: true,
  omitTrailing: false,
  trim: false,
  propertyOrder: EMPTY_ARRAY,
});

/** Read static options once for the lifetime of a merged effective schema. */
export const getStaticChoices = (effective: EffectiveSchema): StaticChoices => {
  const cached = staticChoices.get(effective);
  if (cached) return cached;
  const schema = effective.schema;
  const options =
    typeof schema === 'object' && schema !== null ? schema.options : undefined;
  if (!isPlainObject<Partial<StaticChoices>>(options)) {
    staticChoices.set(effective, DEFAULT_CHOICES);
    return DEFAULT_CHOICES;
  }
  const choices: StaticChoices = Object.freeze({
    omitEmpty: options.omitEmpty ?? true,
    omitTrailing: options.omitTrailing ?? false,
    trim: options.trim ?? false,
    propertyOrder:
      options.propertyOrder === undefined
        ? EMPTY_ARRAY
        : Object.freeze(options.propertyOrder.slice()),
  });
  staticChoices.set(effective, choices);
  return choices;
};
