import type { JsonSchemaWithVirtual } from '@/schema-form/types';

/**
 * computed 하위에 명시된 필드에 대한 alias
 *
 * 예: computed.if -> &if
 */
export const ALIAS = '&';

type ComputedFieldName = keyof NonNullable<JsonSchemaWithVirtual['computed']>;

export type ObservedFieldName = Extract<ComputedFieldName, 'watch'>;

export type ConditionFieldName = Exclude<ComputedFieldName, ObservedFieldName>;
