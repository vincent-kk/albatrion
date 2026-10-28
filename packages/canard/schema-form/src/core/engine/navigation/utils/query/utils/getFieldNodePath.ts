import { parsePointer } from '@/schema-form/helpers/jsonPointer';

/** Preserve optional node-pointer inputs while delegating the grammar to its owner. */
export const getFieldNodePath = (pointer?: string | readonly string[] | null) =>
  parsePointer(pointer ?? '');
