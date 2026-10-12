import { isArray } from '@winglet/common-utils/filter';

import type { EffectiveSchema } from '../../../blueprint';

/** Option-derived choices shared by every call using one effective-schema memo result. */
export interface StaticChoices {
  /** Whether an empty scalar or object is absent from output. */
  readonly omitEmpty: boolean;
  /** Whether nullish and unfilled trailing array positions are excluded. */
  readonly omitTrailing: boolean;
  /** Whether completed string input loses surrounding whitespace. */
  readonly trim: boolean;
  /** Preferred host key order ahead of authored declarations. */
  readonly propertyKeys: readonly string[];
}

/** Effective-schema identity owns its one computed option selection. */
const CHOICES = new WeakMap<EffectiveSchema, StaticChoices>();
/** Shared empty order for schemas without a propertyKeys hint. */
const NO_KEYS: readonly string[] = Object.freeze([]);

/** Read static options once for the lifetime of a merged effective schema. */
export const getStaticChoices = (effective: EffectiveSchema): StaticChoices => {
  const cached = CHOICES.get(effective);
  if (cached) return cached;
  const schema = effective.schema;
  const options = typeof schema === 'object' && schema !== null ? schema.options : undefined;
  const hints = typeof options === 'object' && options !== null && !isArray(options)
    ? options
    : undefined;
  const propertyKeys = hints && 'propertyKeys' in hints ? hints.propertyKeys : undefined;
  const choices: StaticChoices = Object.freeze({
    omitEmpty: !hints || !('omitEmpty' in hints) || hints.omitEmpty !== false,
    omitTrailing: !!hints && 'omitTrailing' in hints && hints.omitTrailing === true,
    trim: !!hints && 'trim' in hints && hints.trim === true,
    propertyKeys: isArray(propertyKeys)
      ? Object.freeze(propertyKeys.filter((key: unknown): key is string => typeof key === 'string'))
      : NO_KEYS,
  });
  CHOICES.set(effective, choices);
  return choices;
};
