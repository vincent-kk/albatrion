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
