import { generateHash, isObject, serializeObject } from '@/common-utils';

export const getSnapshotHash = <T extends object>(
  object: T,
  omit?: Array<keyof T>,
): number | null => {
  if (isInvalidValue(object)) return null;
  return generateHash(serializeObject(object, omit as string[]));
};

const isInvalidValue = (value: unknown): boolean => {
  if (!value) return true;
  else if (isObject(value)) {
    for (const _ in value) return false;
    return true;
  } else return false;
};
