import { JSONPointer } from '@/schema-form/helpers/jsonPointer';

export const getScopedSegment = (
  name: string,
  scope: string,
  variant?: string | number,
) =>
  variant !== undefined
    ? scope + SEPARATOR + variant + SEPARATOR + 'properties' + SEPARATOR + name
    : scope + SEPARATOR + name;

const SEPARATOR = JSONPointer.Separator;
