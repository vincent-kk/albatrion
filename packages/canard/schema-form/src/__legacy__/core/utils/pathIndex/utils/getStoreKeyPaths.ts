import { isArray } from '@winglet/common-utils/filter';

/**
 * Decode a key once when it enters a managed store.
 * @param key - Native store key in the selected identity format
 * @param mode - Absolute path, path/kind tuple, or source/target rule tuple
 * @returns Distinct occurrence paths addressed by this key
 */
export const getStoreKeyPaths = (
  key: string, mode: 'path' | 'pair' | 'rule',
): readonly string[] => {
  if (mode === 'path') return [key];
  const parts: unknown = JSON.parse(key);
  if (!isArray(parts) || typeof parts[0] !== 'string') return [];
  return mode === 'rule' && typeof parts[5] === 'string' && parts[5] !== parts[0]
    ? [parts[0], parts[5]] : [parts[0]];
};
