import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * Alias for fields specified under computed
 * @example computed.if -> &if
 */
export const ALIAS = '&';

type ComputedFieldName = keyof NonNullable<JsonSchemaWithVirtual['computed']>;

export type ObservedFieldName = Extract<ComputedFieldName, 'watch'>;

export type ConditionFieldName = Exclude<ComputedFieldName, ObservedFieldName>;
