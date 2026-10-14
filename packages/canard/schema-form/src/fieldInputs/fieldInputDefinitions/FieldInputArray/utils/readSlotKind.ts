import type { FieldInputProps } from '@/schema-form/types';

/** Native control an empty slot draws: a typed input, or a fill button for anything a single input cannot hold. */
export type SlotKind = 'text' | 'number' | 'checkbox' | 'fill';

/**
 * Choose the control for one empty slot from the schema of its position.
 * @param jsonSchema - Effective array schema; `prefixItems[index]` wins over `items`.
 * @param index - Slot position in the array.
 * @returns `text`, `number` or `checkbox` for a plain primitive position, otherwise `fill`.
 */
export const readSlotKind = (
  jsonSchema: FieldInputProps<any[]>['jsonSchema'],
  index: number,
): SlotKind => {
  const schema = jsonSchema.prefixItems?.[index] ?? jsonSchema.items;
  if (!schema || typeof schema !== 'object' || schema.enum || schema.format)
    return 'fill';
  const type = [schema.type].flat().find((item) => item !== 'null');
  if (type === 'string') return 'text';
  if (type === 'number' || type === 'integer') return 'number';
  return type === 'boolean' ? 'checkbox' : 'fill';
};
