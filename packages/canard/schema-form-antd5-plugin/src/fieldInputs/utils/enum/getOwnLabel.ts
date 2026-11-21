import { hasOwnProperty } from '@winglet/common-utils';

/**
 * Reads a consumer-provided alias for a display key.
 * @param aliases - Optional alias dictionary.
 * @param key - Display string of the scalar.
 * @returns The alias when the dictionary owns the key.
 */
export const getOwnLabel = <T>(
  aliases: Record<string, T> | undefined,
  key: string,
) => (aliases && hasOwnProperty(aliases, key) ? aliases[key] : undefined);
