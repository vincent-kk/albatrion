import type { Fn } from '@aileron/declare';

import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Alias for fields specified under computed
 * @example computed.if -> &if
 */
export const ALIAS = '&';

type ComputedFieldName = keyof NonNullable<JsonSchemaWithVirtual['computed']>;

export type ObservedFieldName = Extract<ComputedFieldName, 'watch'>;

export type ConditionIndexName = Extract<ComputedFieldName, 'if'>;

export type DerivedValueFieldName = Extract<ComputedFieldName, 'derived'>;

export type ConditionFieldName = Exclude<
  ComputedFieldName,
  ObservedFieldName | ConditionIndexName | DerivedValueFieldName
>;

export type DynamicFunction<ReturnType = any> = Fn<
  [dependencies: unknown[]],
  ReturnType
>;

/**
 * Runtime list of the conditional state field names (active/visible/readOnly/
 * disabled/pristine). `satisfies` keeps it in lockstep with
 * {@link ConditionFieldName} — adding/removing a state key fails to compile
 * until this list is updated.
 */
export const STATE_FIELD_NAMES = [
  'active',
  'visible',
  'readOnly',
  'disabled',
  'pristine',
] as const satisfies readonly ConditionFieldName[];

/**
 * Runtime list of ALL computed-block field names (state + watch/derived/if).
 * `satisfies` keeps it in lockstep with {@link ComputedFieldName}.
 */
export const COMPUTED_FIELD_NAMES = [
  ...STATE_FIELD_NAMES,
  'watch',
  'derived',
  'if',
] as const satisfies readonly ComputedFieldName[];
